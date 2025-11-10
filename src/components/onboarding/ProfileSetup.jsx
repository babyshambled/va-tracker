import { useState } from 'react'

export default function ProfileSetup({ role, onComplete, onBack }) {
  const [formData, setFormData] = useState({
    full_name: '',
    hourly_rate: role === 'va' ? '18.00' : ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.full_name.trim()) return

    setSubmitting(true)
    await onComplete({
      ...formData,
      role,
      hourly_rate: role === 'va' ? parseFloat(formData.hourly_rate) : null
    })
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">
              {role === 'va' ? '👤' : '👔'}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-600">
              {role === 'va'
                ? 'Set up your VA profile to start tracking'
                : 'Set up your account to manage your team'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>

            {/* Hourly Rate (VA only) */}
            {role === 'va' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hourly Rate (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                    placeholder="18.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  This will be used for invoice calculations
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !formData.full_name.trim()}
              className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
            >
              {submitting ? 'Setting up...' : 'Complete Setup'}
            </button>
          </form>
        </div>

        {/* Privacy Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Your data is encrypted and secure. We never share your information.
        </p>
      </div>
    </div>
  )
}
