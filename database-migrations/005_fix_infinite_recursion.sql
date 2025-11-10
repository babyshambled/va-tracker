-- Fix infinite recursion in RLS policies
-- The issue: "Bosses can insert VA profiles" policy queries profiles table within itself

-- Drop the problematic policy
DROP POLICY IF EXISTS "Bosses can insert VA profiles" ON profiles;

-- We don't actually need this policy because:
-- 1. Boss profiles are created by the boss themselves (covered by "Users can insert own profile")
-- 2. VA profiles are created by the VAs themselves via invitation flow (covered by "Users can insert own profile")
-- 3. Nobody should be creating profiles on behalf of others

-- Keep only the safe policies:
-- ✓ "Users can insert own profile" - no circular reference
-- ✓ "Users can view own profile" - no circular reference  
-- ✓ "Bosses can view team profiles" - safe because it only checks profiles WHERE id = auth.uid()
-- ✓ "Users can update own profile" - no circular reference

-- The "Bosses can view team profiles" policy needs to be fixed too
-- Current version has circular reference
DROP POLICY IF EXISTS "Bosses can view team profiles" ON profiles;

-- Create corrected policy that checks role via a direct condition, not a subquery
CREATE POLICY "Bosses can view all profiles" ON profiles
  FOR SELECT
  USING (
    -- Users can always see their own profile
    auth.uid() = id 
    OR
    -- Bosses (identified by checking their own profile record directly) can see all profiles
    (
      SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1
    ) = 'boss'
  );

-- Actually, that still has the recursion issue. Let's use a different approach:
-- We'll trust that bosses are properly identified in team_relationships
DROP POLICY IF EXISTS "Bosses can view all profiles" ON profiles;

CREATE POLICY "Bosses can view team VA profiles" ON profiles
  FOR SELECT
  USING (
    -- Users can see their own profile
    auth.uid() = id
    OR
    -- Bosses can see VA profiles in their team
    (
      role = 'va' AND
      EXISTS (
        SELECT 1 FROM team_relationships
        WHERE boss_id = auth.uid()
        AND va_id = profiles.id
        AND status = 'active'
      )
    )
  );

-- Clean up: ensure only necessary policies exist on profiles
-- List of correct policies:
-- 1. "Users can insert own profile" - FOR INSERT - users create their own profile
-- 2. "Users can view own profile" - FOR SELECT - users see their own profile  
-- 3. "Bosses can view team VA profiles" - FOR SELECT - bosses see their VAs
-- 4. "Users can update own profile" - FOR UPDATE - users update their own profile
