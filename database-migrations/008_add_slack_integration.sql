-- Add Slack integration support
-- This allows bosses to receive notifications in Slack

-- Add slack_webhook_url to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS slack_webhook_url text;

-- Add comment
COMMENT ON COLUMN profiles.slack_webhook_url IS 'Slack incoming webhook URL for boss notifications';

-- No RLS changes needed - slack_webhook_url will be accessible through existing policies
