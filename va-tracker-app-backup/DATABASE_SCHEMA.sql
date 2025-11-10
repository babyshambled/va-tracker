-- ============================================
-- VA TRACKER DATABASE SCHEMA
-- Supabase PostgreSQL
-- ============================================

-- 1. PROFILES TABLE (extends Supabase auth.users)
-- ============================================
create table profiles (
  id uuid references auth.users primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('va', 'boss')) not null,
  hourly_rate numeric(10,2) default 18.00,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. TASK TEMPLATES (predefined tasks for time tracking)
-- ============================================
create table task_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text, -- 'linkedin', 'admin', 'meeting', etc.
  estimated_minutes int,
  is_billable boolean default true,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

-- Insert default task templates
insert into task_templates (name, category, estimated_minutes, is_billable) values
  ('LinkedIn Prospecting', 'linkedin', 60, true),
  ('DM Outreach', 'linkedin', 60, true),
  ('Scrum Meeting DMs', 'meeting', 30, true),
  ('Connection Request Sending', 'linkedin', 60, true),
  ('Admin Tasks', 'admin', 30, true),
  ('Research', 'admin', 60, true),
  ('Training', 'admin', 60, false);

-- 3. DAILY TIME LOGS
-- ============================================
create table daily_time_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  log_date date not null,
  tasks jsonb not null, -- [{task_id, task_name, hours, notes}]
  total_hours numeric(5,2) not null,
  questions text[],
  difficulties text[],
  submitted boolean default false,
  submitted_at timestamp with time zone,
  approved_by uuid references profiles(id),
  approved_at timestamp with time zone,
  locked boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, log_date)
);

-- 4. DAILY ACTIVITIES (LinkedIn tracking from original app)
-- ============================================
create table daily_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  activity_date date not null,
  dms_sent int default 0,
  connections_sent int default 0,
  connections_accepted int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, activity_date)
);

-- 5. HIGH-INTEREST CONTACTS
-- ============================================
create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  name text not null,
  linkedin_url text not null,
  priority text check (priority in ('high', 'medium', 'low')) not null,
  notes text,
  date_added date not null,
  created_at timestamp with time zone default now()
);

-- 6. INVOICES
-- ============================================
create table invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null, -- INV-2024-11-001
  user_id uuid references profiles(id) not null,
  month int not null,
  year int not null,
  total_hours numeric(10,2) not null,
  hourly_rate numeric(10,2) not null,
  subtotal numeric(10,2) not null,
  adjustments jsonb, -- [{type: 'bonus'|'deduction', amount, reason}]
  total numeric(10,2) not null,
  status text check (status in ('draft', 'sent', 'paid')) default 'draft',
  generated_at timestamp with time zone default now(),
  pdf_url text,
  notes text
);

-- 7. INVOICE LINE ITEMS
-- ============================================
create table invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  hours numeric(10,2) not null,
  rate numeric(10,2) not null,
  amount numeric(10,2) not null
);

-- 8. AI COACHING SESSIONS
-- ============================================
create table ai_coaching_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  session_date date not null,
  performance_data jsonb not null, -- snapshot of metrics
  prompt_sent text not null,
  ai_response text not null,
  feedback_type text, -- 'motivation', 'strategy', 'problem-solving'
  created_at timestamp with time zone default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table task_templates enable row level security;
alter table daily_time_logs enable row level security;
alter table daily_activities enable row level security;
alter table contacts enable row level security;
alter table invoices enable row level security;
alter table invoice_line_items enable row level security;
alter table ai_coaching_sessions enable row level security;

-- PROFILES POLICIES
-- Users can view their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Bosses can view all profiles
create policy "Bosses can view all profiles" on profiles
  for select using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'boss'
    )
  );

-- Users can update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- TASK TEMPLATES POLICIES
-- Everyone can read task templates
create policy "Everyone can read task templates" on task_templates
  for select using (true);

-- Only bosses can create/modify task templates
create policy "Bosses can manage task templates" on task_templates
  for all using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'boss'
    )
  );

-- DAILY TIME LOGS POLICIES
-- VAs can manage their own time logs (if not locked)
create policy "VAs can create own time logs" on daily_time_logs
  for insert with check (auth.uid() = user_id);

create policy "VAs can view own time logs" on daily_time_logs
  for select using (auth.uid() = user_id);

create policy "VAs can update own unlocked time logs" on daily_time_logs
  for update using (auth.uid() = user_id and locked = false);

-- Bosses can view all time logs
create policy "Bosses can view all time logs" on daily_time_logs
  for select using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'boss'
    )
  );

-- Bosses can approve/lock time logs
create policy "Bosses can approve time logs" on daily_time_logs
  for update using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'boss'
    )
  );

-- DAILY ACTIVITIES POLICIES
-- VAs can manage their own activities
create policy "VAs can manage own activities" on daily_activities
  for all using (auth.uid() = user_id);

-- Bosses can view all activities
create policy "Bosses can view all activities" on daily_activities
  for select using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'boss'
    )
  );

-- CONTACTS POLICIES
-- VAs can manage their own contacts
create policy "VAs can manage own contacts" on contacts
  for all using (auth.uid() = user_id);

-- Bosses can view all contacts
create policy "Bosses can view all contacts" on contacts
  for select using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'boss'
    )
  );

-- INVOICES POLICIES
-- VAs can view their own invoices
create policy "VAs can view own invoices" on invoices
  for select using (auth.uid() = user_id);

-- Bosses can manage all invoices
create policy "Bosses can manage all invoices" on invoices
  for all using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'boss'
    )
  );

-- INVOICE LINE ITEMS POLICIES
-- Inherit from invoices - anyone who can see invoice can see line items
create policy "View line items with invoice access" on invoice_line_items
  for select using (
    exists (
      select 1 from invoices
      where invoices.id = invoice_line_items.invoice_id
      and (invoices.user_id = auth.uid() or exists (
        select 1 from profiles where id = auth.uid() and role = 'boss'
      ))
    )
  );

-- AI COACHING SESSIONS POLICIES
-- Users can view their own sessions
create policy "Users can view own coaching sessions" on ai_coaching_sessions
  for select using (auth.uid() = user_id);

-- Bosses can create coaching sessions for any user
create policy "Bosses can create coaching sessions" on ai_coaching_sessions
  for insert with check (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'boss'
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for profiles
create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at_column();

-- Trigger for daily_time_logs
create trigger update_daily_time_logs_updated_at before update on daily_time_logs
  for each row execute function update_updated_at_column();

-- Trigger for daily_activities
create trigger update_daily_activities_updated_at before update on daily_activities
  for each row execute function update_updated_at_column();

-- ============================================
-- INDEXES (for performance)
-- ============================================

create index daily_time_logs_user_date_idx on daily_time_logs(user_id, log_date);
create index daily_activities_user_date_idx on daily_activities(user_id, activity_date);
create index contacts_user_priority_idx on contacts(user_id, priority);
create index invoices_user_status_idx on invoices(user_id, status);
create index ai_coaching_sessions_user_date_idx on ai_coaching_sessions(user_id, session_date);

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Enable Google OAuth in Supabase Authentication settings
-- 2. Configure email templates (optional)
-- 3. Set up Storage buckets for invoice PDFs (if storing server-side)
