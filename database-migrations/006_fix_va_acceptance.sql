-- Fix RLS to allow VAs to create their team relationship during invitation acceptance
-- Current issue: VAs accepting invitations can't insert into team_relationships

-- Drop existing policy
DROP POLICY IF EXISTS "Bosses can create relationships" ON team_relationships;

-- Create two policies: one for bosses, one for VA acceptance
CREATE POLICY "Bosses can create relationships" ON team_relationships
  FOR INSERT
  WITH CHECK (
    auth.uid() = boss_id
  );

-- Allow VAs to create their own team relationship when accepting invitation
CREATE POLICY "VAs can create own relationship via invitation" ON team_relationships
  FOR INSERT
  WITH CHECK (
    auth.uid() = va_id AND
    -- Verify there's a valid pending invitation
    EXISTS (
      SELECT 1 FROM invitations
      WHERE boss_id = team_relationships.boss_id
      AND status = 'pending'
      AND expires_at > now()
    )
  );
