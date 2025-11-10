-- ============================================
-- ADD IMAGE SUPPORT TO URGENT CONTACTS
-- Migration 009
-- ============================================

-- Add image_urls column to contacts table
ALTER TABLE contacts
ADD COLUMN image_urls text[] DEFAULT '{}';

-- Update priority constraint to ensure we have all three levels
-- (already exists but this ensures it's correct)
ALTER TABLE contacts
DROP CONSTRAINT IF EXISTS contacts_priority_check;

ALTER TABLE contacts
ADD CONSTRAINT contacts_priority_check
CHECK (priority IN ('urgent', 'high', 'medium'));

-- Create storage bucket for contact images (run this in Supabase Storage UI or via API)
-- Bucket name: contact-images
-- Public: false (controlled access via RLS)

-- Note: You'll need to create the storage bucket manually in Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create new bucket called "contact-images"
-- 3. Set it to Private
-- 4. Apply RLS policies below

-- Storage RLS Policies (run after bucket creation)
-- VAs can upload images to their own contacts
-- Policy name: "VAs can upload contact images"
-- Allowed operations: INSERT
-- Target roles: authenticated
-- USING expression: bucket_id = 'contact-images' AND auth.uid()::text = (storage.foldername(name))[1]

-- VAs and Bosses can view contact images
-- Policy name: "Users can view contact images"
-- Allowed operations: SELECT
-- Target roles: authenticated
-- USING expression: bucket_id = 'contact-images'

-- Add index for better performance
CREATE INDEX IF NOT EXISTS contacts_priority_idx ON contacts(priority);

-- ============================================
-- DEPLOYMENT INSTRUCTIONS
-- ============================================
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Go to Storage → Create bucket "contact-images" (Private)
-- 3. Add RLS policies for the storage bucket in Storage settings
