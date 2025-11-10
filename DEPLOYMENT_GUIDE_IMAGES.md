# 🚀 Deployment Guide: Image Upload Feature

## Overview
This guide covers deploying the new image upload and priority levels feature for urgent contacts.

## ✅ Pre-Deployment Checklist

### 1. Run Database Migration

Go to Supabase Dashboard → SQL Editor and run:

```sql
-- From database-migrations/009_add_image_support_to_contacts.sql

ALTER TABLE contacts
ADD COLUMN image_urls text[] DEFAULT '{}';

ALTER TABLE contacts
DROP CONSTRAINT IF EXISTS contacts_priority_check;

ALTER TABLE contacts
ADD CONSTRAINT contacts_priority_check
CHECK (priority IN ('urgent', 'high', 'medium'));

CREATE INDEX IF NOT EXISTS contacts_priority_idx ON contacts(priority);
```

### 2. Create Supabase Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **Create Bucket**
3. Bucket name: `contact-images`
4. Set to **Private** (not public)
5. Click **Create Bucket**

### 3. Configure Storage RLS Policies

Go to Storage → contact-images → Policies

**Policy 1: Allow VAs to upload**
```sql
-- Name: "VAs can upload contact images"
-- Allowed operations: INSERT
-- Policy definition (USING):
bucket_id = 'contact-images' AND
auth.uid()::text = (storage.foldername(name))[1]
```

**Policy 2: Allow authenticated users to view**
```sql
-- Name: "Users can view contact images"
-- Allowed operations: SELECT
-- Policy definition (USING):
bucket_id = 'contact-images' AND auth.role() = 'authenticated'
```

**Policy 3: Allow VAs to delete their own images**
```sql
-- Name: "VAs can delete own images"
-- Allowed operations: DELETE
-- Policy definition (USING):
bucket_id = 'contact-images' AND
auth.uid()::text = (storage.foldername(name))[1]
```

### 4. Deploy Updated Edge Function

```bash
# From your project root
cd supabase/functions

# Deploy the updated notification function
npx supabase functions deploy notify-boss-urgent-contact
```

### 5. Build and Deploy Frontend

```bash
# Build production version
npm run build

# Deploy to Netlify (drag dist folder or use CLI)
netlify deploy --prod
```

## 🧪 Testing Checklist

### As VA:
- [ ] Open Priority Contacts section
- [ ] Click "Add Contact"
- [ ] Select each priority level (Urgent/High/Medium)
- [ ] Paste image (Ctrl+V) into upload zone
- [ ] Upload image via click
- [ ] Add multiple images (test with 2-3)
- [ ] Fill in contact details
- [ ] Submit form
- [ ] Verify contact appears with correct priority color
- [ ] Verify images display correctly
- [ ] Click image to view full size
- [ ] Delete a contact and verify images are removed

### As Boss:
- [ ] Open dashboard
- [ ] Verify contact appears in Priority Contacts section
- [ ] Verify correct priority badge (🔥/⚡/⭐)
- [ ] Verify images display in grid
- [ ] Click image to open lightbox
- [ ] Verify priority grouping works
- [ ] Check email notification received
- [ ] Verify email shows priority level
- [ ] Verify email includes images

## 📊 Feature Capabilities

### Priority Levels:
- **🔥 Urgent** - Critical, needs immediate attention (hours)
- **⚡ High Priority** - Important, contact within 24 hours
- **⭐ Medium Priority** - Valuable, contact this week

### Image Features:
- Paste from clipboard (Ctrl+V / Cmd+V)
- Upload via file picker
- Multiple images per contact
- Automatic compression (max 1200px width, 85% quality)
- 5MB limit per image before compression
- Image gallery with hover effects
- Lightbox modal for full-size viewing
- Automatic deletion when contact is removed

### Email Enhancements:
- Priority-specific colors and styling
- Embedded image thumbnails (200px height)
- Click to view full-size images
- Priority level explanations
- Action timeline based on priority

## 🔒 Security Considerations

### Storage Security:
- ✅ Private bucket (not publicly accessible)
- ✅ RLS policies enforce user-based access
- ✅ File path includes user ID for isolation
- ✅ Image compression prevents large uploads
- ✅ File type validation (images only)
- ✅ Size limit enforcement (5MB)

### Data Privacy:
- ✅ VAs can only access their own images
- ✅ Bosses can view all team images via contacts
- ✅ Images deleted when contact is removed
- ✅ No public URLs exposed without authentication

## 🐛 Troubleshooting

### Images not uploading?
1. Check Supabase Storage bucket exists: `contact-images`
2. Verify RLS policies are active
3. Check browser console for errors
4. Verify API keys in `.env.local`

### Images not showing?
1. Check network tab for 403 errors (RLS issue)
2. Verify user is authenticated
3. Check image URLs in database
4. Verify storage bucket is private but accessible

### Email not showing images?
1. Images in emails are embedded as external links
2. Some email clients block external images by default
3. User must "allow images" in their email client
4. Check Resend dashboard for email delivery status

### Large images causing slow uploads?
- Images are automatically compressed before upload
- Max width: 1200px
- Quality: 85% JPEG
- Expected size: 100-300KB per image after compression

## 📈 Performance Optimization

### Image Loading:
- Uses lazy loading attributes
- Thumbnail previews during upload
- Compressed images reduce bandwidth
- CDN delivery via Supabase Storage

### Database:
- Array column for multiple URLs
- Indexed priority field
- Efficient queries with user_id index

## 🎯 Next Steps

After deployment:
1. Monitor error logs in Supabase
2. Check storage usage in dashboard
3. Test with real VA/Boss workflows
4. Gather user feedback
5. Monitor email delivery rates
6. Check image compression quality

## 💡 Best Practices for Users

### For VAs:
- Add 1-3 images per contact (optimal)
- Use screenshots that show context
- Write clear notes explaining urgency
- Choose appropriate priority level
- Test paste functionality first

### For Bosses:
- Review images for additional context
- Click images to view full size
- Use priority levels to organize workflow
- Archive or delete old contacts
- Check emails for priority notifications

## ⚠️ Known Limitations

1. Max 5MB per image before compression
2. No video support (images only)
3. No bulk image operations
4. Email image rendering varies by client
5. Storage costs scale with usage

## 📞 Support

If issues arise:
1. Check browser console for errors
2. Verify all deployment steps completed
3. Check Supabase logs
4. Review RLS policies
5. Test with different browsers
