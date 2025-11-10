import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useContacts(userId, bossId = null) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId || bossId) {
      fetchContacts()
    }
  }, [userId, bossId])

  async function fetchContacts() {
    try {
      setLoading(true)

      // If bossId is provided, fetch contacts from all VAs in the team
      let query = supabase
        .from('contacts')
        .select(`
          *,
          va:user_id (
            id,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (bossId) {
        // Fetch contacts from all VAs in this boss's team
        const { data: teamVAs } = await supabase
          .from('team_relationships')
          .select('va_id')
          .eq('boss_id', bossId)
          .eq('status', 'active')

        if (teamVAs && teamVAs.length > 0) {
          const vaIds = teamVAs.map(t => t.va_id)
          query = query.in('user_id', vaIds)
        } else {
          // No VAs, return empty
          setContacts([])
          setLoading(false)
          return
        }
      } else {
        // Fetch only this user's contacts
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error
      setContacts(data || [])
    } catch (err) {
      console.error('Error fetching contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  async function addContact(contactData) {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          user_id: userId,
          name: contactData.name,
          linkedin_url: contactData.linkedin_url,
          priority: contactData.priority || 'urgent', // Support all priority levels
          notes: contactData.notes,
          image_urls: contactData.image_urls || [],
          date_added: today
        })
        .select()
        .single()

      if (error) throw error

      // Get VA profile and boss info for email
      const { data: vaProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

      // Get boss info
      const { data: teamRel } = await supabase
        .from('team_relationships')
        .select(`
          boss_id,
          boss:boss_id (
            id,
            full_name,
            email
          )
        `)
        .eq('va_id', userId)
        .eq('status', 'active')
        .single()

      // Send email notification to boss
      if (teamRel && teamRel.boss) {
        try {
          await supabase.functions.invoke('notify-boss-urgent-contact', {
            body: {
              bossEmail: teamRel.boss.email,
              bossName: teamRel.boss.full_name,
              vaName: vaProfile?.full_name || 'Your VA',
              contactName: contactData.name,
              linkedinUrl: contactData.linkedin_url,
              notes: contactData.notes,
              priority: contactData.priority || 'urgent',
              imageUrls: contactData.image_urls || []
            }
          })
          console.log('✅ Boss notified about urgent contact via email')
        } catch (emailErr) {
          console.error('Email notification failed:', emailErr)
          // Don't fail the whole operation if email fails
        }

        // Send Slack notification
        try {
          const priorityEmoji = {
            urgent: '🔥',
            high: '⚡',
            medium: '⭐'
          }
          const emoji = priorityEmoji[contactData.priority] || '🔥'

          await supabase.functions.invoke('send-slack-notification', {
            body: {
              webhookUrl: null, // Will be set via Supabase secret SLACK_WEBHOOK_URL
              blocks: [
                {
                  type: 'header',
                  text: {
                    type: 'plain_text',
                    text: `${emoji} ${contactData.priority?.toUpperCase() || 'URGENT'} Priority Contact Flagged`
                  }
                },
                {
                  type: 'section',
                  fields: [
                    {
                      type: 'mrkdwn',
                      text: `*Contact:*\n${contactData.name}`
                    },
                    {
                      type: 'mrkdwn',
                      text: `*Flagged by:*\n${vaProfile?.full_name || 'VA'}`
                    }
                  ]
                },
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `*LinkedIn:*\n<${contactData.linkedin_url}|View Profile>`
                  }
                },
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `*Context & Notes:*\n${contactData.notes}`
                  }
                },
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `*Screenshots:* ${contactData.image_urls?.length || 0} attached`
                  }
                },
                {
                  type: 'actions',
                  elements: [
                    {
                      type: 'button',
                      text: {
                        type: 'plain_text',
                        text: 'View LinkedIn Profile'
                      },
                      url: contactData.linkedin_url,
                      style: 'primary'
                    }
                  ]
                }
              ]
            }
          })
          console.log('✅ Boss notified about urgent contact via Slack')
        } catch (slackErr) {
          console.error('Slack notification failed:', slackErr)
          // Don't fail the whole operation if Slack fails
        }
      }

      await fetchContacts()
      return { success: true, data }
    } catch (error) {
      console.error('Error adding contact:', error)
      return { success: false, error: error.message }
    }
  }

  async function removeContact(contactId) {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)
        .eq('user_id', userId) // Ensure user can only delete their own contacts

      if (error) throw error

      await fetchContacts()
      return { success: true }
    } catch (error) {
      console.error('Error removing contact:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    contacts,
    loading,
    addContact,
    removeContact,
    refresh: fetchContacts
  }
}
