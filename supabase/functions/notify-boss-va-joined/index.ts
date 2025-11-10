import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { bossEmail, bossName, vaName, vaEmail } = await req.json()

    console.log('Sending VA joined notification to:', bossEmail)

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'VA Tracker <alerts@resend.dev>',
        to: [bossEmail],
        subject: `🎉 ${vaName} has joined your team on VA Tracker!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 10px 10px; border: 2px solid #86efac; }
                .va-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
                .success-badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
                .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 32px;">🎉 New Team Member!</h1>
                </div>
                <div class="content">
                  <p>Great news, <strong>${bossName}</strong>!</p>

                  <div class="va-card">
                    <div class="success-badge">✅ JOINED YOUR TEAM</div>
                    <h2 style="margin: 10px 0; color: #1f2937;">${vaName}</h2>
                    <p style="margin: 10px 0; color: #6b7280;">
                      <strong>Email:</strong> ${vaEmail}
                    </p>
                  </div>

                  <p><strong>${vaName}</strong> has successfully accepted your invitation and completed their onboarding. They can now start logging their LinkedIn outreach activities, and you'll see their performance in real-time on your dashboard.</p>

                  <p style="text-align: center;">
                    <a href="https://vatracker.netlify.app" class="button">View Dashboard →</a>
                  </p>

                  <div style="background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 15px; margin-top: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #1e40af;">
                      <strong>💡 Next Steps:</strong>
                      <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                        <li>Your dashboard will auto-refresh every 10 seconds</li>
                        <li>${vaName} can start logging DMs and connections immediately</li>
                        <li>You'll receive alerts when they flag urgent contacts</li>
                      </ul>
                    </p>
                  </div>
                </div>
                <div class="footer">
                  <p>VA Tracker - LinkedIn Outreach Performance Tracking</p>
                  <p style="font-size: 12px;">You're receiving this because ${vaName} joined your team.</p>
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

    console.log('VA joined email sent successfully:', data.id)

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
