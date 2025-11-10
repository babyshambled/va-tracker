import { useState, useRef, useEffect } from 'react'
import { useContacts } from '../../hooks/useContacts'
import { uploadContactImage, getImagesFromPasteEvent, deleteContactImage } from '../../lib/imageUpload'

const PRIORITY_LEVELS = [
  { value: 'urgent', label: 'Urgent', emoji: '🔥', color: 'red', description: 'Critical - needs immediate attention' },
  { value: 'high', label: 'High Priority', emoji: '⚡', color: 'orange', description: 'Important - contact within 24 hours' },
  { value: 'medium', label: 'Medium Priority', emoji: '⭐', color: 'blue', description: 'Valuable - contact this week' }
]

export default function UrgentContacts({ userId }) {
  console.log('🎯 UrgentContacts: Component mounted/updated with userId:', userId)

  const { contacts, loading, addContact, removeContact } = useContacts(userId)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    console.log('🎯 UrgentContacts: Modal state changed to:', showModal)
  }, [showModal])

  const [formData, setFormData] = useState({
    name: '',
    linkedin_url: '',
    notes: '',
    priority: 'urgent'
  })
  const [images, setImages] = useState([]) // Array of { file: File, preview: string }
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef(null)
  const pasteZoneRef = useRef(null)

  // Log form validation state whenever it changes
  useEffect(() => {
    const isValid = formData.name.trim() && formData.linkedin_url.trim() && formData.notes.trim()
    console.log('🎯 Form validation state:', {
      name: formData.name.trim() ? '✅' : '❌ EMPTY',
      nameValue: formData.name,
      url: formData.linkedin_url.trim() ? '✅' : '❌ EMPTY',
      urlValue: formData.linkedin_url,
      notes: formData.notes.trim() ? '✅' : '❌ EMPTY',
      notesLength: formData.notes.length,
      priority: formData.priority,
      imageCount: images.length,
      isFormValid: isValid,
      buttonWillBeDisabled: !isValid || submitting
    })
  }, [formData, images, submitting])

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🚀 handleSubmit CALLED! Form is being submitted!')

    // Debug logging
    console.log('🎯 Form submission attempt:', {
      name: formData.name,
      nameLength: formData.name.trim().length,
      url: formData.linkedin_url,
      urlLength: formData.linkedin_url.trim().length,
      notes: formData.notes,
      notesLength: formData.notes.trim().length,
      priority: formData.priority,
      imageCount: images.length
    })

    if (!formData.name.trim() || !formData.linkedin_url.trim() || !formData.notes.trim()) {
      console.error('❌ Validation failed - missing required fields')
      alert('⚠️ Please fill in all required fields:\n- Contact Name\n- LinkedIn URL\n- Context & Notes')
      return
    }

    setSubmitting(true)
    setUploadingImages(true)

    try {
      // Upload all images first
      const imageUrls = []
      for (const img of images) {
        const result = await uploadContactImage(img.file, userId)
        if (result.success) {
          imageUrls.push(result.url)
        } else {
          console.error('Failed to upload image:', result.error)
        }
      }

      setUploadingImages(false)

      // Add contact with image URLs
      const result = await addContact({
        name: formData.name.trim(),
        linkedin_url: formData.linkedin_url.trim(),
        notes: formData.notes.trim(),
        priority: formData.priority,
        image_urls: imageUrls
      })

      if (result.success) {
        // Clean up image previews
        images.forEach(img => URL.revokeObjectURL(img.preview))
        setFormData({ name: '', linkedin_url: '', notes: '', priority: 'urgent' })
        setImages([])
        setShowModal(false)
        alert('✅ Contact added! Your boss has been notified.')
        console.log('✅ Contact added successfully')
      } else {
        alert('Error adding contact: ' + result.error)
        console.error('❌ Error adding contact:', result.error)
      }
    } catch (error) {
      alert('Error: ' + error.message)
      console.error('❌ Exception during submission:', error)
      // Clean up previews on error too
      images.forEach(img => URL.revokeObjectURL(img.preview))
    } finally {
      setSubmitting(false)
      setUploadingImages(false)
    }
  }

  const handleDelete = async (contactId, imageUrls) => {
    if (!confirm('Remove this contact? Associated images will also be deleted.')) return

    // Delete images from storage
    if (imageUrls && imageUrls.length > 0) {
      for (const url of imageUrls) {
        await deleteContactImage(url)
      }
    }

    const result = await removeContact(contactId)
    if (!result.success) {
      alert('Error removing contact: ' + result.error)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    addImageFiles(files)
  }

  const handlePaste = (e) => {
    const imageFiles = getImagesFromPasteEvent(e)
    if (imageFiles.length > 0) {
      e.preventDefault()
      addImageFiles(imageFiles)
    }
  }

  const addImageFiles = (files) => {
    const newImages = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }))

    setImages(prev => [...prev, ...newImages])
  }

  const removeImage = (index) => {
    const img = images[index]
    URL.revokeObjectURL(img.preview)
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const getPriorityStyles = (priority) => {
    const styles = {
      urgent: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        hover: 'hover:bg-red-100',
        badge: 'bg-red-600 text-white',
        icon: '🔥'
      },
      high: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-100',
        badge: 'bg-orange-600 text-white',
        icon: '⚡'
      },
      medium: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100',
        badge: 'bg-blue-600 text-white',
        icon: '⭐'
      }
    }
    return styles[priority] || styles.urgent
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">🎯 Priority Contacts</h3>
          <p className="text-sm text-gray-500 mt-1">
            High-priority LinkedIn contacts with images and context
          </p>
        </div>
        <button
          onClick={() => {
            console.log('🎯 "+ Add Contact" button clicked - opening modal')
            setShowModal(true)
          }}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          + Add Contact
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-600 font-medium">No priority contacts yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Add important LinkedIn contacts with screenshots and priority levels
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => {
            const priorityStyle = getPriorityStyles(contact.priority)
            return (
              <div
                key={contact.id}
                className={`flex items-start gap-4 p-4 ${priorityStyle.bg} border-2 ${priorityStyle.border} rounded-xl ${priorityStyle.hover} transition`}
              >
                <div className={`flex-shrink-0 w-10 h-10 ${priorityStyle.badge} rounded-full flex items-center justify-center font-bold text-lg`}>
                  {priorityStyle.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900 text-lg">{contact.name}</h4>
                        <span className={`text-xs ${priorityStyle.badge} px-2 py-1 rounded-full font-semibold uppercase`}>
                          {contact.priority}
                        </span>
                      </div>
                      <a
                        href={contact.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium break-all"
                      >
                        {contact.linkedin_url}
                      </a>

                      {/* Images */}
                      {contact.image_urls && contact.image_urls.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {contact.image_urls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block aspect-square rounded-lg overflow-hidden border-2 border-white hover:border-blue-400 transition"
                            >
                              <img
                                src={url}
                                alt={`Screenshot ${idx + 1}`}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      {contact.notes && (
                        <div className="mt-3 p-3 bg-white rounded-lg border-2 border-gray-200">
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            📝 Notes:
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {contact.notes}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Added {new Date(contact.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(contact.id, contact.image_urls)}
                      className="text-gray-400 hover:text-red-600 transition p-2"
                      title="Remove contact"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl my-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Priority Contact</h3>
              <p className="text-gray-600">
                Your boss will be notified immediately
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Priority Level *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRIORITY_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: level.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.priority === level.value
                          ? `border-${level.color}-500 bg-${level.color}-50 shadow-lg scale-[1.02]`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{level.emoji}</div>
                      <div className="font-bold text-gray-900 mb-1">{level.label}</div>
                      <div className="text-xs text-gray-600">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                />
                {formData.name && !formData.name.trim() && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>Name cannot be empty or just spaces</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  LinkedIn URL *
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://www.linkedin.com/in/johndoe"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                />
                {formData.linkedin_url && !formData.linkedin_url.trim() && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>LinkedIn URL cannot be empty or just spaces</span>
                  </p>
                )}
              </div>

              {/* Image Upload/Paste Zone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Screenshots & Images
                </label>
                <div
                  ref={pasteZoneRef}
                  onPaste={handlePaste}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-400 transition cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Click to upload or paste images (Ctrl+V / Cmd+V)
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB each
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Preview ${idx + 1}`}
                          className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Context & Notes *
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Why is this contact important? What's the context? Any specific talking points?"
                  required
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition resize-none"
                />
                {formData.notes && !formData.notes.trim() && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>Notes cannot be empty or just spaces</span>
                  </p>
                )}
              </div>

              {/* Form validation summary */}
              {!submitting && !uploadingImages && (!formData.name.trim() || !formData.linkedin_url.trim() || !formData.notes.trim()) && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3">
                  <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Please fill in all required fields to continue</span>
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setFormData({ name: '', linkedin_url: '', notes: '', priority: 'urgent' })
                    images.forEach(img => URL.revokeObjectURL(img.preview))
                    setImages([])
                  }}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.name.trim() || !formData.linkedin_url.trim() || !formData.notes.trim()}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
                    submitting || !formData.name.trim() || !formData.linkedin_url.trim() || !formData.notes.trim()
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg'
                  }`}
                  title={
                    !formData.name.trim() || !formData.linkedin_url.trim() || !formData.notes.trim()
                      ? 'Please fill in all required fields'
                      : 'Add contact and notify your boss'
                  }
                >
                  {uploadingImages ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Uploading {images.length} image{images.length !== 1 ? 's' : ''}...
                    </>
                  ) : submitting ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Adding...
                    </>
                  ) : !formData.name.trim() || !formData.linkedin_url.trim() || !formData.notes.trim() ? (
                    '⚠️ Fill Required Fields'
                  ) : (
                    'Add & Notify Boss'
                  )}
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              💡 Boss will receive an email with all details and images
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
