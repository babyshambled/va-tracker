import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useActivities(userId) {
  const [todayActivity, setTodayActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState({ dms: 20, connections: 20 })

  useEffect(() => {
    if (!userId) return
    fetchTodayActivity()
    fetchGoals()
  }, [userId])

  async function fetchTodayActivity() {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_date', today)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error
      }

      if (!data) {
        // Create today's activity record
        const { data: newData, error: insertError } = await supabase
          .from('daily_activities')
          .insert([{
            user_id: userId,
            activity_date: today,
            dms_sent: 0,
            connections_sent: 0,
            connections_accepted: 0
          }])
          .select()
          .single()

        if (insertError) throw insertError
        setTodayActivity(newData)
      } else {
        setTodayActivity(data)
      }
    } catch (err) {
      console.error('Error fetching today activity:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchGoals() {
    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .order('effective_from', { ascending: false })

      if (error) throw error

      const dmsGoal = data.find(g => g.goal_type === 'dms_per_day')
      const connectionsGoal = data.find(g => g.goal_type === 'connections_per_day')

      setGoals({
        dms: dmsGoal?.target_value || 20,
        connections: connectionsGoal?.target_value || 20
      })
    } catch (err) {
      console.error('Error fetching goals:', err)
    }
  }

  async function incrementDMs() {
    if (!todayActivity) return

    const newValue = todayActivity.dms_sent + 1
    const { data, error } = await supabase
      .from('daily_activities')
      .update({ dms_sent: newValue })
      .eq('id', todayActivity.id)
      .select()
      .single()

    if (error) {
      console.error('Error incrementing DMs:', error)
      return
    }

    setTodayActivity(data)
  }

  async function incrementConnections() {
    if (!todayActivity) return

    const newValue = todayActivity.connections_sent + 1
    const { data, error } = await supabase
      .from('daily_activities')
      .update({ connections_sent: newValue })
      .eq('id', todayActivity.id)
      .select()
      .single()

    if (error) {
      console.error('Error incrementing connections:', error)
      return
    }

    setTodayActivity(data)
  }

  async function incrementAccepted() {
    if (!todayActivity) return

    const newValue = todayActivity.connections_accepted + 1
    const { data, error } = await supabase
      .from('daily_activities')
      .update({ connections_accepted: newValue })
      .eq('id', todayActivity.id)
      .select()
      .single()

    if (error) {
      console.error('Error incrementing accepted:', error)
      return
    }

    setTodayActivity(data)
  }

  async function decrementDMs() {
    if (!todayActivity || todayActivity.dms_sent <= 0) return

    const newValue = todayActivity.dms_sent - 1
    const { data, error } = await supabase
      .from('daily_activities')
      .update({ dms_sent: newValue })
      .eq('id', todayActivity.id)
      .select()
      .single()

    if (error) {
      console.error('Error decrementing DMs:', error)
      return
    }

    setTodayActivity(data)
  }

  async function decrementConnections() {
    if (!todayActivity || todayActivity.connections_sent <= 0) return

    const newValue = todayActivity.connections_sent - 1
    const { data, error } = await supabase
      .from('daily_activities')
      .update({ connections_sent: newValue })
      .eq('id', todayActivity.id)
      .select()
      .single()

    if (error) {
      console.error('Error decrementing connections:', error)
      return
    }

    setTodayActivity(data)
  }

  async function decrementAccepted() {
    if (!todayActivity || todayActivity.connections_accepted <= 0) return

    const newValue = todayActivity.connections_accepted - 1
    const { data, error } = await supabase
      .from('daily_activities')
      .update({ connections_accepted: newValue })
      .eq('id', todayActivity.id)
      .select()
      .single()

    if (error) {
      console.error('Error decrementing accepted:', error)
      return
    }

    setTodayActivity(data)
  }

  return {
    todayActivity,
    goals,
    loading,
    incrementDMs,
    incrementConnections,
    incrementAccepted,
    decrementDMs,
    decrementConnections,
    decrementAccepted,
    refresh: fetchTodayActivity
  }
}
