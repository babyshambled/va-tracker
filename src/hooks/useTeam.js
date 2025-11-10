import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useTeam(bossId) {
  const [vas, setVas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bossId) return
    fetchVAs()
  }, [bossId, fetchVAs])

  const fetchVAs = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)

      // Get team relationships
      const { data: relationships, error: relError } = await supabase
        .from('team_relationships')
        .select(`
          *,
          va:va_id (
            id,
            full_name,
            email,
            created_at
          )
        `)
        .eq('boss_id', bossId)
        .eq('status', 'active')

      if (relError) throw relError

      // For each VA, get today's activity
      const vasWithActivity = await Promise.all(
        (relationships || []).map(async (rel) => {
          const today = new Date().toISOString().split('T')[0]

          const { data: activity } = await supabase
            .from('daily_activities')
            .select('*')
            .eq('user_id', rel.va_id)
            .eq('activity_date', today)
            .single()

          return {
            ...rel.va,
            todayActivity: activity || {
              dms_sent: 0,
              connections_sent: 0,
              connections_accepted: 0
            }
          }
        })
      )

      setVas(vasWithActivity)
    } catch (err) {
      console.error('Error fetching VAs:', err)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [bossId])

  // Silent refresh function for auto-refresh (no loading state)
  // Stable function reference that won't cause useEffect to re-run
  const silentRefresh = useCallback(async () => {
    await fetchVAs(true)
  }, [fetchVAs])

  async function inviteVA(vaData) {
    try {
      // Upsert invitation record (updates existing or creates new)
      // Generate new token and expiration
      const newToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .upsert({
          boss_id: bossId,
          email: vaData.email,
          full_name: vaData.full_name,
          hourly_rate: vaData.hourly_rate || 18.00,
          status: 'pending',
          token: newToken,
          expires_at: expiresAt
        }, {
          onConflict: 'boss_id,email'
        })
        .select()
        .single()

      if (inviteError) throw inviteError

      const invitationLink = `${window.location.origin}/accept-invitation?token=${invitation.token}`
      
      // Get boss profile for email
      const { data: bossProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', bossId)
        .single()

      // Send invitation email via Edge Function
      try {
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invitation-email', {
          body: {
            email: vaData.email,
            fullName: vaData.full_name,
            invitationLink,
            bossName: bossProfile?.full_name || 'Your Boss'
          }
        })

        if (emailError) {
          console.error('Email sending failed:', emailError)
          // Don't fail the whole invitation if email fails
        } else {
          console.log('✅ Invitation email sent successfully to', vaData.email)
        }
      } catch (emailErr) {
        console.error('Email error:', emailErr)
        // Continue even if email fails - user can copy link manually
      }

      // Still log to console for testing/backup
      console.log('='.repeat(80))
      console.log('INVITATION CREATED!')
      console.log('Invitation link:', invitationLink)
      console.log('='.repeat(80))

      return {
        success: true,
        invitation,
        invitationLink
      }
    } catch (error) {
      console.error('Error inviting VA:', error)
      return { success: false, error: error.message }
    }
  }

  async function removeVA(vaId) {
    try {
      const { error } = await supabase
        .from('team_relationships')
        .update({ status: 'inactive' })
        .eq('boss_id', bossId)
        .eq('va_id', vaId)

      if (error) throw error

      await fetchVAs()
      return { success: true }
    } catch (error) {
      console.error('Error removing VA:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    vas,
    loading,
    inviteVA,
    removeVA,
    refresh: fetchVAs,
    silentRefresh
  }
}
