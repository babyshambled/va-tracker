-- Create invitations table for proper VA onboarding flow
-- This allows boss to invite VAs who then accept and create their own accounts

CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boss_id uuid REFERENCES profiles(id) NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  hourly_rate numeric(10,2) DEFAULT 18.00,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status text CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  UNIQUE(boss_id, email)
);

-- Add indexes for performance
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_boss_id ON invitations(boss_id);
CREATE INDEX idx_invitations_status ON invitations(status);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitations
-- Bosses can create invitations
CREATE POLICY "Bosses can create invitations" ON invitations
  FOR INSERT
  WITH CHECK (
    auth.uid() = boss_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'boss'
    )
  );

-- Bosses can view their own invitations
CREATE POLICY "Bosses can view own invitations" ON invitations
  FOR SELECT
  USING (auth.uid() = boss_id);

-- Anyone with valid token can view invitation (for acceptance page)
CREATE POLICY "Anyone can view by token" ON invitations
  FOR SELECT
  USING (true); -- We'll validate token in application logic

-- Bosses can update their own invitations (e.g., cancel/resend)
CREATE POLICY "Bosses can update own invitations" ON invitations
  FOR UPDATE
  USING (auth.uid() = boss_id)
  WITH CHECK (auth.uid() = boss_id);

-- Function to mark expired invitations
CREATE OR REPLACE FUNCTION mark_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE invitations
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add created_by and modified_by tracking to team_relationships
ALTER TABLE team_relationships
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS invitation_id uuid REFERENCES invitations(id),
ADD COLUMN IF NOT EXISTS notes text;

-- Add audit columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS modified_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS modified_by uuid REFERENCES profiles(id);

-- Create trigger to update modified_at
CREATE OR REPLACE FUNCTION update_modified_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modified_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_modified_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_at();

COMMENT ON TABLE invitations IS 'Stores VA invitation tokens sent by bosses';
COMMENT ON COLUMN invitations.token IS 'Unique token for invitation link, 64 character hex string';
COMMENT ON COLUMN invitations.expires_at IS 'Invitation expires 7 days after creation';
