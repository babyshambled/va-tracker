-- Allow bosses to update team relationships (for removing VAs)
-- This enables soft deletion by setting status = 'inactive'

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Bosses can update team relationships" ON team_relationships;

-- Create policy to allow bosses to update their team relationships
CREATE POLICY "Bosses can update team relationships" ON team_relationships
  FOR UPDATE
  USING (auth.uid() = boss_id)
  WITH CHECK (auth.uid() = boss_id);
