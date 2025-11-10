import { supabase } from './supabaseClient'

/**
 * Compresses an image file to reduce size before upload
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<Blob>} - Compressed image blob
 */
export async function compressImage(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target.result
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Uploads an image to Supabase Storage
 * @param {File|Blob} file - The image file to upload
 * @param {string} userId - The user ID (for folder organization)
 * @param {string} contactId - Optional contact ID for naming
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadContactImage(file, userId, contactId = null) {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be smaller than 5MB')
    }

    // Compress image
    console.log('Compressing image...')
    const compressedBlob = await compressImage(file)

    // Generate unique filename
    const fileExt = 'jpg'  // Always save as JPEG after compression
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = contactId
      ? `${userId}/${contactId}_${timestamp}_${randomStr}.${fileExt}`
      : `${userId}/${timestamp}_${randomStr}.${fileExt}`

    // Upload to Supabase Storage
    console.log('Uploading to storage...', fileName)
    const { data, error } = await supabase.storage
      .from('contact-images')
      .upload(fileName, compressedBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw error
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('contact-images')
      .getPublicUrl(fileName)

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get image URL')
    }

    console.log('Upload successful:', urlData.publicUrl)
    return { success: true, url: urlData.publicUrl }

  } catch (error) {
    console.error('Image upload error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Deletes an image from Supabase Storage
 * @param {string} imageUrl - The full URL of the image to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteContactImage(imageUrl) {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/contact-images/')
    if (pathParts.length < 2) {
      throw new Error('Invalid image URL')
    }
    const filePath = pathParts[1]

    // Delete from storage
    const { error } = await supabase.storage
      .from('contact-images')
      .remove([filePath])

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Image deletion error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Handles paste events to extract images from clipboard
 * @param {ClipboardEvent} e - The paste event
 * @returns {File[]} - Array of image files from clipboard
 */
export function getImagesFromPasteEvent(e) {
  const files = []
  const items = e.clipboardData?.items || []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    // Check if the item is an image
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        files.push(file)
      }
    }
  }

  return files
}
