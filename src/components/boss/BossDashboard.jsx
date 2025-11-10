import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTeam } from '../../hooks/useTeam'
import VACard from './VACard'
import UrgentContactsList from './UrgentContactsList'

export default function BossDashboard({ user, profile }) {
  const { vas, loading, inviteVA, removeVA, refresh, silentRefresh } = useTeam(user.id)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({ full_name: '', email: '', hourly_rate: '18.00' })
  const [inviting, setInviting] = useState(false)
  const [invitationLink, setInvitationLink] = useState(null)

  // Auto-refresh every 10 seconds to get latest VA activity (only if VAs exist)
  // Uses silentRefresh to avoid flashing the screen
  useEffect(() => {
    if (vas.length === 0) return // Don't refresh if no VAs yet

    const interval = setInterval(() => {
      silentRefresh() // Silent background refresh without loading state
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [silentRefresh, vas.length])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <div className="text-lg text-gray-600">Loading your team...</div>
        </div>
      </div>
    )
  }

  // Calculate team totals
  const teamStats = vas.reduce((acc, va) => ({
    totalDMs: acc.totalDMs + (va.todayActivity?.dms_sent || 0),
    totalConnections: acc.totalConnections + (va.todayActivity?.connections_sent || 0),
    totalAccepted: acc.totalAccepted + (va.todayActivity?.connections_accepted || 0)
  }), { totalDMs: 0, totalConnections: 0, totalAccepted: 0 })

  const handleInviteVA = async (e) => {
    e.preventDefault()
    if (!inviteForm.full_name.trim() || !inviteForm.email.trim()) return

    setInviting(true)
    const result = await inviteVA({
      full_name: inviteForm.full_name.trim(),
      email: inviteForm.email.trim().toLowerCase(),
      hourly_rate: parseFloat(inviteForm.hourly_rate) || 18.00
    })

    setInviting(false)

    if (result.success) {
      // Show the invitation link
      setInvitationLink(result.invitationLink)
    } else {
      alert('Error creating invitation: ' + result.error)
    }
  }

  const handleCloseInvitation = () => {
    setShowInviteModal(false)
    setInvitationLink(null)
    setInviteForm({ full_name: '', email: '', hourly_rate: '18.00' })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-emerald-600 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">
              Welcome back, {profile.full_name}! 👔
            </h1>
            <p className="text-white">
              {vas.length === 0
                ? "Add your first VA to start tracking performance"
                : `Managing ${vas.length} ${vas.length === 1 ? 'VA' : 'VAs'}`
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              className="bg-white bg-opacity-20 text-white px-5 py-3 rounded-xl font-semibold hover:bg-opacity-30 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              + Add VA
            </button>
          </div>
        </div>
      </div>

      {vas.length === 0 ? (
        // Empty State
        <div className="bg-gradient-to-br from-white to-primary-50 rounded-2xl p-12 text-center border-2 border-primary-100 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="text-7xl mb-6">🚀</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Build Your High-Performance Team
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Add your first Virtual Assistant to start tracking LinkedIn outreach performance in real-time
            </p>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-primary-100 shadow-sm">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-bold text-gray-900 mb-2">Real-Time Tracking</h3>
                <p className="text-sm text-gray-600">
                  Monitor daily performance as it happens
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-primary-100 shadow-sm">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-bold text-gray-900 mb-2">Goal Management</h3>
                <p className="text-sm text-gray-600">
                  Set and track customizable daily targets
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-primary-100 shadow-sm">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="font-bold text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-sm text-gray-600">
                  Insights to optimize team performance
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-emerald-600 px-8 py-4 rounded-xl font-bold text-lg text-white hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Add Your First VA
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Team Statistics */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 border-2 border-primary-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Team Size
                </div>
                <div className="text-2xl">👥</div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {vas.length}
              </div>
              <div className="text-sm text-gray-500 mt-1">Active VAs</div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Total DMs
                </div>
                <div className="text-2xl">💬</div>
              </div>
              <div className="text-3xl font-bold text-emerald-600">
                {teamStats.totalDMs}
              </div>
              <div className="text-sm text-gray-500 mt-1">Today</div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-amber-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Connections
                </div>
                <div className="text-2xl">🤝</div>
              </div>
              <div className="text-3xl font-bold text-amber-600">
                {teamStats.totalConnections}
              </div>
              <div className="text-sm text-gray-500 mt-1">Today</div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-green-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Accepted
                </div>
                <div className="text-2xl">✅</div>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {teamStats.totalAccepted}
              </div>
              <div className="text-sm text-gray-500 mt-1">Today</div>
            </div>
          </div>

          {/* Individual VA Performance */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Team Performance</h2>
            <p className="text-gray-600 mb-4">Click on any VA to see their full dashboard view</p>

            <div className="space-y-4">
              {vas.map((va) => (
                <VACard key={va.id} va={va} goals={{ dms: 20, connections: 20 }} onRemove={removeVA} />
              ))}
            </div>
          </div>

          {/* Urgent Contacts from Team */}
          <UrgentContactsList bossId={user.id} />
        </>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            {!invitationLink ? (
              <>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">👤</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Invite VA to Team</h3>
                  <p className="text-gray-600">
                    Send an invitation to a new virtual assistant
                  </p>
                </div>

                <form onSubmit={handleInviteVA} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition"
                />
              </div>

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
                    value={inviteForm.hourly_rate}
                    onChange={(e) => setInviteForm({ ...inviteForm, hourly_rate: e.target.value })}
                    placeholder="18.00"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition"
                  />
                </div>
              </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseInvitation}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={inviting || !inviteForm.full_name.trim() || !inviteForm.email.trim()}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      {inviting ? 'Creating...' : 'Send Invitation'}
                    </button>
                  </div>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                  VA will receive an invitation link to join your team
                </p>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">✉️</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Invitation Created!</h3>
                  <p className="text-gray-600">
                    Send this link to {inviteForm.full_name}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Invitation Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={invitationLink}
                        readOnly
                        className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-mono text-gray-600"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(invitationLink)
                          alert('Link copied to clipboard!')
                        }}
                        className="px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition whitespace-nowrap"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex gap-3">
                      <div className="text-blue-600 text-xl">ℹ️</div>
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Next Steps:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Copy the invitation link above</li>
                          <li>Send it to {inviteForm.email} via email or messaging</li>
                          <li>They'll create their account and join your team</li>
                          <li>Link expires in 7 days</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCloseInvitation}
                    className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
