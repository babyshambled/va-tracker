import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Hook to fetch and manage activities for a specific date
 * @param {string} userId - User ID
 * @param {string} date - Date in YYYY-MM-DD format
 */
export function useActivityByDate(userId, date) {
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [goals] = useState({ dms: 20, connections: 20 })

  useEffect(() => {
    if (!userId || !date) return
    fetchActivity()
  }, [userId, date])

  async function fetchActivity() {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_date', date)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error
      }

      if (!data) {
        // Create activity record for this date
        const { data: newData, error: insertError } = await supabase
          .from('daily_activities')
          .insert([{
            user_id: userId,
            activity_date: date,
            dms_sent: 0,
            connections_sent: 0,
            connections_accepted: 0
          }])
          .select()
          .single()

        if (insertError) throw insertError
        setActivity(newData)
      } else {
        setActivity(data)
      }
    } catch (err) {
      console.error('Error fetching activity:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateActivity(field, value) {
    if (!activity) return

    const { data, error } = await supabase
      .from('daily_activities')
      .update({ [field]: value })
      .eq('id', activity.id)
      .select()
      .single()

    if (error) {
      console.error(`Error updating ${field}:`, error)
      return { success: false, error }
    }

    setActivity(data)
    return { success: true, data }
  }

  async function setDMs(value) {
    return updateActivity('dms_sent', value)
  }

  async function setConnections(value) {
    return updateActivity('connections_sent', value)
  }

  async function setAccepted(value) {
    return updateActivity('connections_accepted', value)
  }

  return {
    activity,
    goals,
    loading,
    setDMs,
    setConnections,
    setAccepted,
    refresh: fetchActivity
  }
}
