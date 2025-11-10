-- ============================================
-- VA TRACKER - ADDITIONAL TABLES
-- Feedback, Alerts, Goals, Team Relationships
-- ============================================

-- 1. TEAM RELATIONSHIPS (Boss -> Multiple VAs)
-- ============================================
create table team_relationships (
  id uuid primary key default gen_random_uuid(),
  boss_id uuid references profiles(id) not null,
  va_id uuid references profiles(id) not null,
  status text check (status in ('active', 'inactive', 'pending')) default 'active',
  invited_at timestamp with time zone default now(),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique(boss_id, va_id)
);

-- 2. USER GOALS/TARGETS (Customizable per VA)
-- ============================================
create table user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  goal_type text not null, -- 'dms_per_day', 'connections_per_day'
  target_value int not null,
  effective_from date not null,
  created_by uuid references profiles(id), -- boss who set the goal
  created_at timestamp with time zone default now()
);

-- Insert default goals for new users
insert into user_goals (user_id, goal_type, target_value, effective_from)
select id, 'dms_per_day', 20, current_date from profiles where role = 'va';

insert into user_goals (user_id, goal_type, target_value, effective_from)
select id, 'connections_per_day', 20, current_date from profiles where role = 'va';

-- 3. FEEDBACK SYSTEM (On-demand)
-- ============================================
create table feedback (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references profiles(id) not null, -- boss
  to_user_id uuid references profiles(id) not null,   -- VA
  feedback_date date not null,
  rating int check (rating between 1 and 5),
  message text not null,
  category text check (category in ('daily', 'weekly', 'monthly', 'ad_hoc')) default 'ad_hoc',
  is_private boolean default false, -- if true, only visible to VA and boss
  read_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- 4. NOTIFICATIONS/ALERTS (For Boss)
-- ============================================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null, -- recipient (boss)
  related_user_id uuid references profiles(id), -- the VA this alert is about
  type text not null, -- 'missed_goal', 'no_activity', 'feedback_request', 'performance_drop'
  severity text check (severity in ('info', 'warning', 'urgent')) default 'info',
  title text not null,
  message text not null,
  action_url text, -- link to relevant page
  read boolean default false,
  dismissed boolean default false,
  created_at timestamp with time zone default now()
);

-- 5. ALERT THRESHOLDS (Configurable by Boss)
-- ============================================
create table alert_thresholds (
  id uuid primary key default gen_random_uuid(),
  boss_id uuid references profiles(id) not null,
  threshold_type text not null, -- 'missed_goals_consecutive', 'no_activity_hours', 'acceptance_rate_drop'
  threshold_value numeric not null,
  enabled boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(boss_id, threshold_type)
);

-- Insert default thresholds for bosses
insert into alert_thresholds (boss_id, threshold_type, threshold_value, enabled)
select id, 'missed_goals_consecutive', 2, true from profiles where role = 'boss'; -- Alert after 2 days of missed goals

insert into alert_thresholds (boss_id, threshold_type, threshold_value, enabled)
select id, 'no_activity_hours', 24, true from profiles where role = 'boss'; -- Alert if no activity for 24 hours

insert into alert_thresholds (boss_id, threshold_type, threshold_value, enabled)
select id, 'acceptance_rate_drop', 20, true from profiles where role = 'boss'; -- Alert if acceptance rate drops below 20%

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

alter table team_relationships enable row level security;
alter table user_goals enable row level security;
alter table feedback enable row level security;
alter table notifications enable row level security;
alter table alert_thresholds enable row level security;

-- TEAM RELATIONSHIPS POLICIES
create policy "Bosses can manage their team relationships" on team_relationships
  for all using (auth.uid() = boss_id);

create policy "VAs can view their team relationships" on team_relationships
  for select using (auth.uid() = va_id);

-- USER GOALS POLICIES
create policy "Users can view their own goals" on user_goals
  for select using (auth.uid() = user_id);

create policy "Bosses can manage VA goals" on user_goals
  for all using (
    exists (
      select 1 from team_relationships
      where boss_id = auth.uid()
      and va_id = user_goals.user_id
      and status = 'active'
    )
  );

-- FEEDBACK POLICIES
create policy "Users can view feedback to/from them" on feedback
  for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Bosses can create feedback for their VAs" on feedback
  for insert with check (
    auth.uid() = from_user_id and
    exists (
      select 1 from team_relationships
      where boss_id = auth.uid()
      and va_id = to_user_id
      and status = 'active'
    )
  );

-- NOTIFICATIONS POLICIES
create policy "Users can view their own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "Users can update their own notifications" on notifications
  for update using (auth.uid() = user_id);

-- System can create notifications (handled via service role)

-- ALERT THRESHOLDS POLICIES
create policy "Bosses can manage their alert thresholds" on alert_thresholds
  for all using (auth.uid() = boss_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to check for missed goals and create alerts
create or replace function check_missed_goals()
returns void as $$
declare
  v_relationship record;
  v_activity record;
  v_threshold int;
  v_consecutive_misses int;
begin
  -- Loop through all active boss-VA relationships
  for v_relationship in
    select tr.boss_id, tr.va_id, p.full_name as va_name
    from team_relationships tr
    join profiles p on p.id = tr.va_id
    where tr.status = 'active'
  loop
    -- Get the boss's threshold for consecutive missed goals
    select threshold_value into v_threshold
    from alert_thresholds
    where boss_id = v_relationship.boss_id
    and threshold_type = 'missed_goals_consecutive'
    and enabled = true;

    if v_threshold is null then
      continue;
    end if;

    -- Check last N days for missed goals
    select count(*) into v_consecutive_misses
    from (
      select activity_date,
             dms_sent,
             connections_sent,
             (select target_value from user_goals where user_id = v_relationship.va_id and goal_type = 'dms_per_day' order by effective_from desc limit 1) as dms_goal,
             (select target_value from user_goals where user_id = v_relationship.va_id and goal_type = 'connections_per_day' order by effective_from desc limit 1) as conn_goal
      from daily_activities
      where user_id = v_relationship.va_id
      and activity_date >= current_date - interval '7 days'
      order by activity_date desc
      limit v_threshold
    ) recent_days
    where dms_sent < dms_goal or connections_sent < conn_goal;

    -- Create alert if threshold exceeded
    if v_consecutive_misses >= v_threshold then
      insert into notifications (user_id, related_user_id, type, severity, title, message)
      values (
        v_relationship.boss_id,
        v_relationship.va_id,
        'missed_goal',
        'warning',
        format('%s has missed goals for %s days', v_relationship.va_name, v_consecutive_misses),
        format('%s has not hit their daily targets for %s consecutive days. Consider checking in with them.', v_relationship.va_name, v_consecutive_misses)
      )
      on conflict do nothing; -- Prevent duplicate alerts
    end if;
  end loop;
end;
$$ language plpgsql security definer;

-- Function to mark feedback as read
create or replace function mark_feedback_read(feedback_id uuid)
returns void as $$
begin
  update feedback
  set read_at = now()
  where id = feedback_id
  and to_user_id = auth.uid()
  and read_at is null;
end;
$$ language plpgsql security definer;

-- ============================================
-- INDEXES
-- ============================================

create index team_relationships_boss_idx on team_relationships(boss_id);
create index team_relationships_va_idx on team_relationships(va_id);
create index user_goals_user_type_idx on user_goals(user_id, goal_type);
create index feedback_to_user_idx on feedback(to_user_id, created_at desc);
create index feedback_from_user_idx on feedback(from_user_id, created_at desc);
create index notifications_user_read_idx on notifications(user_id, read, created_at desc);

-- ============================================
-- SCHEDULED JOBS (Run via pg_cron or external cron)
-- ============================================

-- NOTE: These should be run daily at a specific time (e.g., 6pm)
-- via Supabase Edge Functions or external scheduler
--
-- Example: Run check_missed_goals() every day at 6pm
-- select check_missed_goals();
