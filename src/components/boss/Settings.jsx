import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export default function Settings({ userId }) {
  const [slackWebhook, setSlackWebhook] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [userId])

  async function fetchSettings() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('slack_webhook_url')
        .eq('id', userId)
        .single()

      if (error) throw error
      setSlackWebhook(data.slack_webhook_url || '')
    } catch (err) {
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      setSaved(false)

      const { error } = await supabase
        .from('profiles')
        .update({ slack_webhook_url: slackWebhook.trim() || null })
        .eq('id', userId)

      if (error) throw error

      setSaved(true)

      // Reset "Saved!" message after 3 seconds
      setTimeout(() => {
        setSaved(false)
      }, 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      alert('Error saving settings: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function testSlackWebhook() {
    if (!slackWebhook.trim()) {
      alert('Please enter a Slack webhook URL first')
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-slack-notification', {
        body: {
          webhookUrl: slackWebhook.trim(),
          message: '🎉 VA Tracker connected! You\'ll receive notifications here when:\n• A VA joins your team\n• A VA flags an urgent contact\n• Important updates occur'
        }
      })

      if (error) throw error
      alert('✅ Test message sent to Slack! Check your channel.')
    } catch (err) {
      console.error('Error testing Slack:', err)
      alert('❌ Failed to send test message. Please check your webhook URL.')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-semibold mb-3 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">⚙️ Settings</h2>
          <p className="text-gray-600 mt-1">Configure notifications and integrations</p>
        </div>
      </div>

      {/* Slack Integration Section */}
      <div className="space-y-6">
        <div className="border-2 border-gray-200 rounded-xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Slack Integration</h3>
              <p className="text-sm text-gray-600">
                Get real-time notifications in Slack when VAs join your team or flag urgent contacts
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Slack Incoming Webhook URL
              </label>
              <input
                type="url"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition font-mono text-sm"
              />
            </div>

            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center gap-2"
            >
              {showInstructions ? '▼' : '▶'} How to get a Slack webhook URL
            </button>

            {showInstructions && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-purple-900 mb-2">📝 Quick Setup (5 minutes):</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-purple-800">
                  <li>Go to <a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noopener noreferrer" className="underline font-semibold">api.slack.com/messaging/webhooks</a></li>
                  <li>Click "Create your Slack app" → "From scratch"</li>
                  <li>Name it "VA Tracker" and select your workspace</li>
                  <li>Go to "Incoming Webhooks" → Toggle "Activate"</li>
                  <li>Click "Add New Webhook to Workspace"</li>
                  <li><strong>Choose ANY existing channel</strong> (e.g., #general, #notifications, #va-updates)</li>
                  <li>Copy the webhook URL and paste it above</li>
                </ol>

                <div className="mt-3 pt-3 border-t border-purple-300">
                  <p className="text-sm font-semibold text-purple-900 mb-1">💡 Channel Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-purple-800">
                    <li><strong>#notifications</strong> - If you have a general notifications channel</li>
                    <li><strong>#va-tracker</strong> - Create a dedicated channel for VA updates (recommended)</li>
                    <li><strong>#general</strong> - Works fine if you want everyone to see updates</li>
                    <li><strong>Private channel</strong> - Also supported if you want to keep it private</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={testSlackWebhook}
                disabled={!slackWebhook.trim()}
                className="px-6 py-3 border-2 border-purple-300 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Send Test Message
              </button>
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
                  saved
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>

        {slackWebhook && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="text-green-600 text-xl">✅</div>
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">Slack integration active!</p>
                <p>You'll receive notifications when:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>A VA joins your team</li>
                  <li>A VA flags an urgent contact</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
