-- Debug script to check team relationships
-- Run this in Supabase SQL Editor

-- 1. Check if team_relationships table has any data
SELECT
  id,
  boss_id,
  va_id,
  status,
  created_at
FROM team_relationships
ORDER BY created_at DESC;

-- 2. Check profiles table to see users
SELECT
  id,
  email,
  full_name,
  role
FROM profiles
ORDER BY created_at DESC;

-- 3. Check contacts table
SELECT
  id,
  user_id,
  name,
  linkedin_url,
  priority,
  created_at
FROM contacts
ORDER BY created_at DESC;

-- 4. Check if VA's boss relationship exists
-- Replace 'ae2ff9d5-5a0b-4970-8889-097a4ddb0eba' with your VA's user ID from console
SELECT
  tr.id as relationship_id,
  tr.status,
  boss.id as boss_id,
  boss.email as boss_email,
  boss.full_name as boss_name,
  va.id as va_id,
  va.email as va_email,
  va.full_name as va_name
FROM team_relationships tr
JOIN profiles boss ON boss.id = tr.boss_id
JOIN profiles va ON va.id = tr.va_id
WHERE tr.va_id = 'ae2ff9d5-5a0b-4970-8889-097a4ddb0eba';
