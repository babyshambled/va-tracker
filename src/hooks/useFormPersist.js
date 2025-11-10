import { useEffect, useState } from 'react'

/**
 * Hook to persist form data to sessionStorage
 * Automatically saves form data on every change and restores it on mount
 *
 * @param {string} key - Unique storage key for this form
 * @param {object} formData - Current form data object
 * @param {function} setFormData - Function to update form data
 * @returns {object} - { clearPersistedData, hasSavedDraft }
 */
export function useFormPersist(key, formData, setFormData) {
  const [hasSavedDraft, setHasSavedDraft] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from sessionStorage on mount
  useEffect(() => {
    if (isInitialized) return

    try {
      const saved = sessionStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved)

        // Only restore if there's actual content (not just empty strings)
        const hasContent = Object.values(parsed).some(val => {
          if (typeof val === 'string') return val.trim().length > 0
          if (Array.isArray(val)) return val.length > 0
          return false
        })

        if (hasContent) {
          setFormData(parsed)
          setHasSavedDraft(true)
          console.log('📝 Form data restored from session storage')
        }
      }
    } catch (error) {
      console.error('❌ Error loading persisted form data:', error)
    }

    setIsInitialized(true)
  }, [key, isInitialized])

  // Save to sessionStorage on every change (after initialization)
  useEffect(() => {
    if (!isInitialized) return

    try {
      // Check if form has any content worth saving
      const hasContent = Object.values(formData).some(val => {
        if (typeof val === 'string') return val.trim().length > 0
        if (Array.isArray(val)) return val.length > 0
        return false
      })

      if (hasContent) {
        sessionStorage.setItem(key, JSON.stringify(formData))
        console.log('💾 Form data auto-saved')
      }
    } catch (error) {
      console.error('❌ Error saving form data:', error)
    }
  }, [formData, key, isInitialized])

  // Clear sessionStorage on successful submit
  const clearPersistedData = () => {
    try {
      sessionStorage.removeItem(key)
      setHasSavedDraft(false)
      console.log('🗑️ Cleared persisted form data')
    } catch (error) {
      console.error('❌ Error clearing persisted data:', error)
    }
  }

  return { clearPersistedData, hasSavedDraft }
}
