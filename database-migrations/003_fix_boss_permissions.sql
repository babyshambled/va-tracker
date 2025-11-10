-- Fix RLS policies to allow boss to manage their team
-- This fixes the "new row violates row-level security policy" error

-- 1. DROP existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 2. CREATE comprehensive policies for profiles table
-- Allow users to insert their own profile during onboarding
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow bosses to insert VA profiles for their team
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

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow bosses to view all VA profiles in their team
CREATE POLICY "Bosses can view team profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'boss'
    )
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. FIX team_relationships policies
DROP POLICY IF EXISTS "Users can view own relationships" ON team_relationships;
DROP POLICY IF EXISTS "Bosses can create relationships" ON team_relationships;

-- Bosses can create team relationships
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

-- Bosses can view their team relationships
CREATE POLICY "Bosses can view team relationships" ON team_relationships
  FOR SELECT
  USING (auth.uid() = boss_id);

-- VAs can view their relationships
CREATE POLICY "VAs can view own relationships" ON team_relationships
  FOR SELECT
  USING (auth.uid() = va_id);

-- 4. FIX user_goals policies
DROP POLICY IF EXISTS "Users can view own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can manage own goals" ON user_goals;

-- Users can view their own goals
CREATE POLICY "Users can view own goals" ON user_goals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Bosses can view goals for their VAs
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

-- Bosses can create goals for their VAs
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

-- Bosses can update goals for their VAs
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
DROP POLICY IF EXISTS "Users can view own activities" ON daily_activities;
DROP POLICY IF EXISTS "Users can manage own activities" ON daily_activities;

-- VAs can view their own activities
CREATE POLICY "VAs can view own activities" ON daily_activities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Bosses can view activities for their VAs
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

-- VAs can insert their own activities
CREATE POLICY "VAs can insert own activities" ON daily_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- VAs can update their own activities
CREATE POLICY "VAs can update own activities" ON daily_activities
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. FEEDBACK table policies (for future use)
DROP POLICY IF EXISTS "Users can view received feedback" ON feedback;
DROP POLICY IF EXISTS "Bosses can give feedback" ON feedback;

-- Users can view feedback they received
CREATE POLICY "Users can view received feedback" ON feedback
  FOR SELECT
  USING (auth.uid() = to_user_id);

-- Bosses can view feedback they sent
CREATE POLICY "Bosses can view sent feedback" ON feedback
  FOR SELECT
  USING (auth.uid() = from_user_id);

-- Bosses can give feedback to their VAs
CREATE POLICY "Bosses can give feedback" ON feedback
  FOR INSERT
  WITH CHECK (
    auth.uid() = from_user_id AND
    EXISTS (
      SELECT 1 FROM team_relationships
      WHERE boss_id = auth.uid()
      AND va_id = feedback.to_user_id
      AND status = 'active'
    )
  );

-- 7. NOTIFICATIONS table policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can create notifications (we'll use service role for this)
-- Bosses can create notifications for their VAs
CREATE POLICY "Bosses can create team notifications" ON notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_relationships
      WHERE boss_id = auth.uid()
      AND va_id = notifications.user_id
      AND status = 'active'
    )
  );

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
