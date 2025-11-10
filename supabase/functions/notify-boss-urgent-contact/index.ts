import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRIORITY_CONFIG = {
  urgent: {
    color: '#DC2626',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    bgColor: '#fff5f5',
    borderColor: '#fecaca',
    badgeColor: '#ef4444',
    label: '🔥 URGENT',
    description: 'Critical - Needs Immediate Attention'
  },
  high: {
    color: '#EA580C',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    badgeColor: '#f97316',
    label: '⚡ HIGH PRIORITY',
    description: 'Important - Contact Within 24 Hours'
  },
  medium: {
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    badgeColor: '#3b82f6',
    label: '⭐ MEDIUM PRIORITY',
    description: 'Valuable - Contact This Week'
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      bossEmail,
      bossName,
      vaName,
      contactName,
      linkedinUrl,
      notes,
      priority = 'urgent',
      imageUrls = []
    } = await req.json()

    console.log('Sending priority contact notification to:', bossEmail)
    console.log('Priority:', priority, 'Images:', imageUrls?.length || 0)

    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.urgent

    // Build images HTML section
    let imagesHtml = ''
    if (imageUrls && imageUrls.length > 0) {
      const imageItems = imageUrls.map((url, idx) => `
        <div style="display: inline-block; width: 48%; margin: 1%; vertical-align: top;">
          <a href="${url}" target="_blank" style="display: block; text-decoration: none;">
            <img
              src="${url}"
              alt="Screenshot ${idx + 1}"
              style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; border: 2px solid #e5e7eb; transition: transform 0.2s;"
            />
          </a>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280; text-align: center;">Screenshot ${idx + 1}</p>
        </div>
      `).join('')

      imagesHtml = `
        <div style="margin: 20px 0;">
          <p style="margin: 0 0 12px 0; font-weight: bold; color: #1f2937; font-size: 14px;">
            📸 Screenshots & Context (${imageUrls.length})
          </p>
          <div style="text-align: left;">
            ${imageItems}
          </div>
          <p style="margin: 15px 0 0 0; font-size: 12px; color: #6b7280; text-align: center;">
            💡 Click images to view full size
          </p>
        </div>
      `
    }

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
        subject: `${config.label.split(' ')[0]} ${vaName} flagged ${contactName} for contact`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: ${config.gradient};
                  color: white;
                  padding: 30px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
                }
                .content {
                  background: ${config.bgColor};
                  padding: 30px;
                  border-radius: 0 0 10px 10px;
                  border: 2px solid ${config.borderColor};
                }
                .contact-card {
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  border-left: 4px solid ${config.badgeColor};
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .priority-badge {
                  display: inline-block;
                  background: ${config.badgeColor};
                  color: white;
                  padding: 6px 14px;
                  border-radius: 12px;
                  font-size: 12px;
                  font-weight: bold;
                  margin-bottom: 12px;
                  text-transform: uppercase;
                }
                .button {
                  display: inline-block;
                  background: ${config.badgeColor};
                  color: white;
                  padding: 14px 28px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                  margin: 20px 0;
                  transition: opacity 0.2s;
                }
                .button:hover {
                  opacity: 0.9;
                }
                .notes-section {
                  background: #fef2f2;
                  padding: 15px;
                  border-radius: 8px;
                  margin-top: 15px;
                  border: 1px solid ${config.borderColor};
                }
                .footer {
                  text-align: center;
                  margin-top: 30px;
                  color: #6b7280;
                  font-size: 14px;
                }
                .priority-description {
                  background: white;
                  padding: 12px;
                  border-radius: 6px;
                  margin: 15px 0;
                  border: 2px solid ${config.borderColor};
                  font-size: 14px;
                  color: #1f2937;
                }
                @media only screen and (max-width: 600px) {
                  .container { padding: 10px; }
                  .header { padding: 20px; }
                  .content { padding: 20px; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 32px;">${config.label}</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 16px;">
                    ${config.description}
                  </p>
                </div>
                <div class="content">
                  <p style="font-size: 16px;"><strong>${vaName}</strong> has flagged a priority LinkedIn contact that needs your attention!</p>

                  <div class="priority-description">
                    <strong>⏱️ Action Required:</strong> ${
                      priority === 'urgent' ? 'Contact within the next few hours' :
                      priority === 'high' ? 'Contact within 24 hours' :
                      'Contact this week when convenient'
                    }
                  </div>

                  <div class="contact-card">
                    <div class="priority-badge">${config.label}</div>
                    <h2 style="margin: 10px 0; color: #1f2937; font-size: 24px;">${contactName}</h2>
                    <p style="margin: 10px 0;">
                      <strong>LinkedIn Profile:</strong><br>
                      <a href="${linkedinUrl}" style="color: #0ea5e9; word-break: break-all; text-decoration: none;">${linkedinUrl}</a>
                    </p>

                    <p style="margin: 15px 0 5px 0; font-size: 12px; color: #6b7280;">
                      <strong>Flagged by:</strong> ${vaName}
                    </p>

                    ${imagesHtml}

                    <div class="notes-section">
                      <p style="margin: 0 0 8px 0; font-weight: bold; color: ${config.color};">💡 Context & Notes:</p>
                      <p style="margin: 0; color: #1f2937; white-space: pre-wrap; font-size: 14px;">${notes}</p>
                    </div>
                  </div>

                  <p style="text-align: center;">
                    <a href="${linkedinUrl}" class="button">View LinkedIn Profile →</a>
                  </p>

                  <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 20px; border: 2px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #1f2937;">📊 Priority Levels Explained:</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4b5563;">
                      <li style="margin: 5px 0;"><strong>🔥 Urgent:</strong> Critical opportunities requiring immediate action</li>
                      <li style="margin: 5px 0;"><strong>⚡ High:</strong> Important contacts to reach within 24 hours</li>
                      <li style="margin: 5px 0;"><strong>⭐ Medium:</strong> Valuable leads to contact this week</li>
                    </ul>
                  </div>

                  <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                    <strong>💡 Pro Tip:</strong> Review any screenshots provided for additional context about ${contactName} before reaching out.
                  </p>
                </div>
                <div class="footer">
                  <p style="margin: 5px 0;"><strong>VA Tracker</strong></p>
                  <p style="margin: 5px 0;">LinkedIn Outreach Performance Tracking</p>
                  <p style="font-size: 12px; margin: 15px 0 5px 0;">This is an automated alert from your VA's activity tracking system.</p>
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

    console.log('Priority contact email sent successfully:', data.id)

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
