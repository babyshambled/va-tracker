-- Diagnostic script to understand the user account mismatch

-- 1. Show all users and their roles
SELECT
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 2. Show team relationships
SELECT
  tr.id as relationship_id,
  tr.boss_id,
  tr.va_id,
  tr.status,
  boss.email as boss_email,
  boss.full_name as boss_name,
  va.email as va_email,
  va.full_name as va_name
FROM team_relationships tr
LEFT JOIN profiles boss ON boss.id = tr.boss_id
LEFT JOIN profiles va ON va.id = tr.va_id
ORDER BY tr.created_at DESC;

-- 3. Show contacts and who added them
SELECT
  c.id,
  c.name,
  c.user_id as added_by_user_id,
  p.email as added_by_email,
  p.full_name as added_by_name,
  c.priority,
  c.created_at
FROM contacts c
LEFT JOIN profiles p ON p.id = c.user_id
ORDER BY c.created_at DESC;

-- 4. Show the specific mismatch
SELECT
  'PROBLEM DIAGNOSIS' as issue,
  'Contacts were added by user: ae2ff9d5-5a0b-4970-8889-097a4ddb0eba' as contact_creator,
  'But boss team relationship points to VA: 962a5846-f226-4ac3-b549-a01148193272' as team_va,
  'These are DIFFERENT users!' as problem;

-- 5. SOLUTION: Update team relationship to correct VA
-- Uncomment and run this to fix:
/*
UPDATE team_relationships
SET va_id = 'ae2ff9d5-5a0b-4970-8889-097a4ddb0eba'
WHERE boss_id = 'ae2ff9d5-5a0b-4970-8889-097a4ddb0eba';
*/
