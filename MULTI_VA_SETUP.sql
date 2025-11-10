-- Setup for Boss Who Also Acts as VA
-- This creates a proper multi-VA team structure

-- STEP 1: Check current accounts
SELECT
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- STEP 2: Create your personal VA account (if needed)
-- You'll need to sign up with a separate email first
-- Then run this to link it to your boss account:

-- Replace 'YOUR-PERSONAL-VA-UUID' with the ID after you create the account
/*
INSERT INTO team_relationships (boss_id, va_id, status)
VALUES (
  'ae2ff9d5-5a0b-4970-8889-097a4ddb0eba',  -- Boss ID
  'YOUR-PERSONAL-VA-UUID',                  -- Your personal VA account ID
  'active'
);
*/

-- STEP 3: Move test contacts to your personal VA account
/*
UPDATE contacts
SET user_id = 'YOUR-PERSONAL-VA-UUID'
WHERE user_id = 'ae2ff9d5-5a0b-4970-8889-097a4ddb0eba';
*/

-- STEP 4: Verify team structure
SELECT
  tr.id as relationship_id,
  boss.email as boss_email,
  boss.full_name as boss_name,
  va.email as va_email,
  va.full_name as va_name,
  va.id as va_id,
  tr.status
FROM team_relationships tr
JOIN profiles boss ON boss.id = tr.boss_id
JOIN profiles va ON va.id = tr.va_id
WHERE tr.boss_id = 'ae2ff9d5-5a0b-4970-8889-097a4ddb0eba'
ORDER BY tr.created_at;

-- This should show TWO rows:
-- 1. Boss -> Personal VA account
-- 2. Boss -> Employee VA account

-- STEP 5: Verify all contacts will show up
SELECT
  c.name,
  c.priority,
  p.full_name as added_by,
  p.email as va_email,
  c.created_at
FROM contacts c
JOIN profiles p ON p.id = c.user_id
WHERE c.user_id IN (
  SELECT va_id
  FROM team_relationships
  WHERE boss_id = 'ae2ff9d5-5a0b-4970-8889-097a4ddb0eba'
    AND status = 'active'
)
ORDER BY c.created_at DESC;

-- This should show ALL contacts from ALL your VAs
