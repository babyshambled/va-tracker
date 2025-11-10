# Email Setup for VA Invitations

This guide explains how to set up automatic email sending for VA invitations using Resend.

## Prerequisites

1. **Resend Account** - Sign up at https://resend.com (free tier: 100 emails/day)
2. **Supabase CLI** - Install from https://supabase.com/docs/guides/cli

## Step 1: Get Resend API Key

1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it "VA Tracker Invitations"
4. Copy the API key (starts with `re_`)

## Step 2: Deploy Edge Function

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
npx supabase login

# Link your project (get project ref from Supabase dashboard)
npx supabase link --project-ref YOUR_PROJECT_REF

# Set the Resend API key as a secret
npx supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Deploy the edge function
npx supabase functions deploy send-invitation-email
```

## Step 3: Verify Domain (Production Only)

For production, you need to verify your domain in Resend:

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `vatracker.app`)
4. Add the DNS records Resend provides
5. Wait for verification

Then update the edge function to use your domain:
```typescript
from: 'VA Tracker <invitations@yourdomain.com>'
```

## Testing

1. Create an invitation in the app
2. Check your console - you should see "✅ Invitation email sent successfully"
3. Check the VA's email inbox
4. The email should arrive within seconds

## Troubleshooting

### Email not sending

Check the browser console for errors:
```javascript
// If you see "Email sending failed"
// Check Supabase logs:
npx supabase functions logs send-invitation-email
```

### Invalid API Key

If you see "Invalid API key" error:
1. Verify the key is correct in Resend dashboard
2. Re-set the secret: `npx supabase secrets set RESEND_API_KEY=YOUR_KEY`
3. Redeploy: `npx supabase functions deploy send-invitation-email`

### Emails going to spam

For development, use a test email service like:
- MailHog (local)
- Mailtrap (cloud)

For production:
- Verify your domain in Resend
- Add SPF/DKIM records
- Warm up your domain gradually

## Cost

- **Resend Free Tier**: 100 emails/day, 3,000/month
- **Paid Plans**: Start at $20/month for 50,000 emails

For most users, the free tier is sufficient!
