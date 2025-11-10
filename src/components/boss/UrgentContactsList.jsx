import { useState } from 'react'
import { useContacts } from '../../hooks/useContacts'

const PRIORITY_CONFIG = {
  urgent: {
    bg: 'bg-gradient-to-r from-red-50 to-rose-50',
    border: 'border-red-300',
    badge: 'bg-red-600',
    text: 'text-red-900',
    icon: '🔥',
    label: 'URGENT'
  },
  high: {
    bg: 'bg-gradient-to-r from-orange-50 to-amber-50',
    border: 'border-orange-300',
    badge: 'bg-orange-600',
    text: 'text-orange-900',
    icon: '⚡',
    label: 'HIGH PRIORITY'
  },
  medium: {
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    border: 'border-blue-300',
    badge: 'bg-blue-600',
    text: 'text-blue-900',
    icon: '⭐',
    label: 'MEDIUM PRIORITY'
  }
}

export default function UrgentContactsList({ bossId }) {
  const { contacts, loading } = useContacts(null, bossId)
  const [selectedImage, setSelectedImage] = useState(null)

  const getPriorityConfig = (priority) => {
    return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.urgent
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Priority Contacts from Team</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Priority Contacts from Team</h2>
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-600 font-medium">No priority contacts flagged yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Your VAs can flag important contacts with screenshots and priority levels
          </p>
        </div>
      </div>
    )
  }

  // Group contacts by priority for better organization
  const groupedContacts = contacts.reduce((acc, contact) => {
    const priority = contact.priority || 'urgent'
    if (!acc[priority]) acc[priority] = []
    acc[priority].push(contact)
    return acc
  }, {})

  const priorityOrder = ['urgent', 'high', 'medium']

  return (
    <>
      <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎯 Priority Contacts from Team</h2>
            <p className="text-gray-600 mt-1">Important contacts flagged by your VAs with visual context</p>
          </div>
          <div className="flex gap-2">
            {priorityOrder.map(priority => {
              const count = groupedContacts[priority]?.length || 0
              const config = getPriorityConfig(priority)
              if (count === 0) return null
              return (
                <div key={priority} className={`${config.badge} text-white px-4 py-2 rounded-full font-bold text-sm`}>
                  {config.icon} {count}
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          {priorityOrder.map(priority => {
            const priorityContacts = groupedContacts[priority] || []
            if (priorityContacts.length === 0) return null

            const config = getPriorityConfig(priority)

            return (
              <div key={priority}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`${config.badge} text-white px-3 py-1 rounded-lg font-bold text-sm flex items-center gap-2`}>
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </div>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                <div className="space-y-4">
                  {priorityContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`${config.bg} border-2 ${config.border} rounded-xl p-6 hover:shadow-lg transition-all`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 ${config.badge} text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg`}>
                          {config.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap mb-2">
                                <h3 className={`font-bold text-xl ${config.text}`}>
                                  {contact.name}
                                </h3>
                                <span className={`${config.badge} text-white px-3 py-1 rounded-full font-bold text-xs uppercase`}>
                                  {config.label}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Flagged by: <strong>{contact.va?.full_name || 'Unknown VA'}</strong>
                                {' • '}
                                <span className="text-xs text-gray-500">
                                  {new Date(contact.created_at).toLocaleString()}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* LinkedIn Link */}
                          <a
                            href={contact.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm mb-4 hover:underline bg-white px-4 py-2 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                            View LinkedIn Profile
                          </a>

                          {/* Images Gallery */}
                          {contact.image_urls && contact.image_urls.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <span>📸</span>
                                <span>Screenshots ({contact.image_urls.length})</span>
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {contact.image_urls.map((url, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setSelectedImage(url)}
                                    className="relative aspect-square rounded-lg overflow-hidden border-3 border-white hover:border-blue-400 shadow-md hover:shadow-xl transition-all group cursor-pointer"
                                  >
                                    <img
                                      src={url}
                                      alt={`Screenshot ${idx + 1}`}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                    />
                                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity flex items-center justify-center">
                                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                      </svg>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {contact.notes && (
                            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                              <p className={`text-sm font-bold ${config.text} mb-2 flex items-center gap-2`}>
                                <span>💡</span>
                                <span>Context & Notes:</span>
                              </p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {contact.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {contacts.length > 0 && (
          <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="font-bold text-blue-900 mb-1">Pro Tips:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>🔥 Urgent</strong> contacts need immediate attention (within hours)</li>
                  <li>• <strong>⚡ High Priority</strong> contacts should be reached within 24 hours</li>
                  <li>• <strong>⭐ Medium Priority</strong> contacts are valuable but can wait a few days</li>
                  <li>• Click on screenshots to view full-size and gather context</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
