import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Hook to fetch all historical activities for a user
 * @param {string} userId - User ID
 * @param {number} daysBack - Number of days to fetch (default 30)
 */
export function useHistoricalActivities(userId, daysBack = 30) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchActivities()
  }, [userId, daysBack])

  async function fetchActivities() {
    try {
      setLoading(true)

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysBack)

      const { data, error } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', userId)
        .gte('activity_date', startDate.toISOString().split('T')[0])
        .lte('activity_date', endDate.toISOString().split('T')[0])
        .order('activity_date', { ascending: false })

      if (error) throw error
      setActivities(data || [])
    } catch (err) {
      console.error('Error fetching historical activities:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    activities,
    loading,
    refresh: fetchActivities
  }
}
