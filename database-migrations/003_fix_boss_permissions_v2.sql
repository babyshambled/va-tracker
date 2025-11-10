-- Fix RLS policies to allow boss to manage their team
-- This version handles existing policies gracefully

-- 1. DROP all existing policies on profiles
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    DROP POLICY IF EXISTS "Bosses can insert VA profiles" ON profiles;
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Bosses can view team profiles" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Some policies may not exist yet';
END $$;

-- 2. CREATE comprehensive policies for profiles table
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Bosses can insert VA profiles" ON profiles
  FOR INSERT
  WITH CHECK (
    role = 'va' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'boss'
    )
  );

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Bosses can view team profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'boss'
    )
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. FIX team_relationships policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own relationships" ON team_relationships;
    DROP POLICY IF EXISTS "Bosses can create relationships" ON team_relationships;
    DROP POLICY IF EXISTS "Bosses can view team relationships" ON team_relationships;
    DROP POLICY IF EXISTS "VAs can view own relationships" ON team_relationships;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Some policies may not exist yet';
END $$;

CREATE POLICY "Bosses can create relationships" ON team_relationships
  FOR INSERT
  WITH CHECK (
    auth.uid() = boss_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'boss'
    )
  );

CREATE POLICY "Bosses can view team relationships" ON team_relationships
  FOR SELECT
  USING (auth.uid() = boss_id);

CREATE POLICY "VAs can view own relationships" ON team_relationships
  FOR SELECT
  USING (auth.uid() = va_id);

-- 4. FIX user_goals policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own goals" ON user_goals;
    DROP POLICY IF EXISTS "Users can manage own goals" ON user_goals;
    DROP POLICY IF EXISTS "Bosses can view team goals" ON user_goals;
    DROP POLICY IF EXISTS "Bosses can create team goals" ON user_goals;
    DROP POLICY IF EXISTS "Bosses can update team goals" ON user_goals;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Some policies may not exist yet';
END $$;

CREATE POLICY "Users can view own goals" ON user_goals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Bosses can view team goals" ON user_goals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_relationships
      WHERE boss_id = auth.uid()
      AND va_id = user_goals.user_id
      AND status = 'active'
    )
  );

CREATE POLICY "Bosses can create team goals" ON user_goals
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_relationships
      WHERE boss_id = auth.uid()
      AND va_id = user_goals.user_id
      AND status = 'active'
    )
  );

CREATE POLICY "Bosses can update team goals" ON user_goals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_relationships
      WHERE boss_id = auth.uid()
      AND va_id = user_goals.user_id
      AND status = 'active'
    )
  );

-- 5. FIX daily_activities policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own activities" ON daily_activities;
    DROP POLICY IF EXISTS "Users can manage own activities" ON daily_activities;
    DROP POLICY IF EXISTS "VAs can view own activities" ON daily_activities;
    DROP POLICY IF EXISTS "Bosses can view team activities" ON daily_activities;
    DROP POLICY IF EXISTS "VAs can insert own activities" ON daily_activities;
    DROP POLICY IF EXISTS "VAs can update own activities" ON daily_activities;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Some policies may not exist yet';
END $$;

CREATE POLICY "VAs can view own activities" ON daily_activities
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Bosses can view team activities" ON daily_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_relationships
      WHERE boss_id = auth.uid()
      AND va_id = daily_activities.user_id
      AND status = 'active'
    )
  );

CREATE POLICY "VAs can insert own activities" ON daily_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "VAs can update own activities" ON daily_activities
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
