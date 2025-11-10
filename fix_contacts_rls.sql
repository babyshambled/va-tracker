-- ============================================
-- FIX CONTACTS RLS POLICY
-- Issue: VAs cannot insert contacts due to incorrect RLS policy
-- ============================================

-- Drop the existing broken policy
DROP POLICY IF EXISTS "VAs can manage own contacts" ON contacts;

-- Create separate policies with correct syntax
-- VAs can INSERT their own contacts
CREATE POLICY "VAs can insert own contacts" ON contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- VAs can SELECT their own contacts
CREATE POLICY "VAs can select own contacts" ON contacts
  FOR SELECT
  USING (auth.uid() = user_id);

-- VAs can UPDATE their own contacts
CREATE POLICY "VAs can update own contacts" ON contacts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- VAs can DELETE their own contacts
CREATE POLICY "VAs can delete own contacts" ON contacts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Note: The "Bosses can view all contacts" policy already exists and is correct
