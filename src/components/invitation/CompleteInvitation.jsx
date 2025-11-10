import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export default function CompleteInvitation() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [processing, setProcessing] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (token) {
      completeInvitation()
    } else {
      setError('Missing invitation token')
      setProcessing(false)
    }
  }, [token])

  async function completeInvitation() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Not authenticated. Please try again.')
      }

      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single()

      if (inviteError) throw new Error('Invalid or expired invitation')

      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('This invitation has expired')
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: invitation.full_name,
          role: 'va',
          hourly_rate: invitation.hourly_rate,
          created_by: invitation.boss_id
        })

      if (profileError) throw profileError

      const { error: relationshipError } = await supabase
        .from('team_relationships')
        .insert({
          boss_id: invitation.boss_id,
          va_id: user.id,
          status: 'active',
          created_by: invitation.boss_id,
          invitation_id: invitation.id
        })

      if (relationshipError) throw relationshipError

      await supabase
        .from('user_goals')
        .insert([
          {
            user_id: user.id,
            goal_type: 'dms_per_day',
            target_value: 20,
            effective_from: new Date().toISOString()
          },
          {
            user_id: user.id,
            goal_type: 'connections_per_day',
            target_value: 20,
            effective_from: new Date().toISOString()
          }
        ])

      await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id)

      // Notify boss that VA has joined
      const { data: bossProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', invitation.boss_id)
        .single()

      if (bossProfile) {
        try {
          await supabase.functions.invoke('notify-boss-va-joined', {
            body: {
              bossEmail: bossProfile.email,
              bossName: bossProfile.full_name,
              vaName: invitation.full_name,
              vaEmail: user.email
            }
          })
          console.log('✅ Boss notified that VA joined')
        } catch (notifyError) {
          console.error('Failed to notify boss:', notifyError)
          // Don't fail the whole flow if notification fails
        }
      }

      setTimeout(() => {
        navigate('/')
      }, 2000)

    } catch (err) {
      console.error('Error completing invitation:', err)
      setError(err.message || 'Failed to complete invitation')
      setProcessing(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-emerald-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-emerald-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {processing ? 'Setting up your account...' : 'All set!'}
        </h2>
        <p className="text-gray-600">
          {processing ? 'Please wait while we configure everything' : 'Redirecting to your dashboard...'}
        </p>
      </div>
    </div>
  )
}
