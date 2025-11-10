import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useProfile(user) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    fetchProfile()
  }, [user])

  async function fetchProfile() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  async function createProfile(profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            ...profileData
          }
        ])
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return { success: true, data }
    } catch (err) {
      console.error('Error creating profile:', err)
      return { success: false, error: err.message }
    }
  }

  async function updateProfile(updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return { success: true, data }
    } catch (err) {
      console.error('Error updating profile:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    refreshProfile: fetchProfile
  }
}
