import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, fullName, invitationLink, bossName } = await req.json()

    console.log('Sending invitation email to:', email)

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'VA Tracker <onboarding@resend.dev>',
        to: [email],
        subject: `You're invited to join ${bossName}'s team on VA Tracker!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 32px;">🎉 You're Invited!</h1>
                </div>
                <div class="content">
                  <p>Hi ${fullName},</p>
                  <p><strong>${bossName}</strong> has invited you to join their team on VA Tracker!</p>
                  <p>VA Tracker helps you track your LinkedIn outreach performance, set goals, and collaborate with your team in real-time.</p>
                  <p style="text-align: center;">
                    <a href="${invitationLink}" class="button">Accept Invitation & Sign In</a>
                  </p>
                  <p style="font-size: 14px; color: #6b7280;">
                    Or copy and paste this link into your browser:<br>
                    <code style="background: #e5e7eb; padding: 8px; display: inline-block; margin-top: 8px; border-radius: 4px;">${invitationLink}</code>
                  </p>
                  <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                    <strong>Note:</strong> This invitation link expires in 7 days.
                  </p>
                </div>
                <div class="footer">
                  <p>VA Tracker - LinkedIn Outreach Performance Tracking</p>
                  <p style="font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
                </div>
              </div>
            </body>
          </html>
        `
      })
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend API error:', data)
      throw new Error(data.message || JSON.stringify(data))
    }

    console.log('Email sent successfully:', data.id)

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})
