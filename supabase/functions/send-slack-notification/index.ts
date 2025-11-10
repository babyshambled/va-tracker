import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { webhookUrl, message, blocks } = await req.json()

    if (!webhookUrl) {
      throw new Error('Webhook URL is required')
    }

    console.log('Sending Slack notification to:', webhookUrl)

    // Send notification to Slack
    const slackPayload = blocks ? { blocks } : { text: message }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackPayload)
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Slack API error:', errorText)
      throw new Error(`Slack API error: ${errorText}`)
    }

    console.log('Slack notification sent successfully')

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    console.error('Slack notification error:', error)
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
