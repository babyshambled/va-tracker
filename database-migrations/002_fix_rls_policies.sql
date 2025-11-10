-- ============================================
-- FIX RLS POLICIES - Remove Infinite Recursion
-- ============================================

-- Drop the problematic policies
drop policy if exists "Bosses can view all profiles" on profiles;
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- Recreate profiles policies without recursion
-- Users can ALWAYS view their own profile (no recursion)
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Users can insert their own profile on first login
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Bosses can view profiles of their VAs
create policy "Bosses can view team profiles" on profiles
  for select using (
    -- Can view own profile
    auth.uid() = id
    OR
    -- Can view VAs in their team
    exists (
      select 1 from team_relationships
      where team_relationships.boss_id = auth.uid()
      and team_relationships.va_id = profiles.id
      and team_relationships.status = 'active'
    )
  );

-- VAs can view their boss's profile
create policy "VAs can view boss profile" on profiles
  for select using (
    -- Can view own profile
    auth.uid() = id
    OR
    -- Can view their boss's profile
    exists (
      select 1 from team_relationships
      where team_relationships.va_id = auth.uid()
      and team_relationships.boss_id = profiles.id
      and team_relationships.status = 'active'
    )
  );

-- ============================================
-- Verify policies are working
-- ============================================
-- After running this, users should be able to:
-- 1. Create their profile on first login
-- 2. View their own profile
-- 3. Update their own profile
-- 4. Bosses can view VA profiles in their team
-- 5. VAs can view their boss's profile
