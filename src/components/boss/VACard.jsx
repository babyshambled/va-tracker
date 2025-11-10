import { useState } from 'react'

export default function VACard({ va, goals = { dms: 20, connections: 20 }, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [removing, setRemoving] = useState(false)

  const activity = va.todayActivity || { dms_sent: 0, connections_sent: 0, connections_accepted: 0 }

  const handleRemove = async () => {
    setRemoving(true)
    const result = await onRemove(va.id)
    if (result.success) {
      setShowRemoveModal(false)
    } else {
      alert('Error removing VA: ' + result.error)
      setRemoving(false)
    }
  }
  const acceptanceRate = activity.connections_sent > 0
    ? Math.round((activity.connections_accepted / activity.connections_sent) * 100)
    : 0

  const dmsProgress = (activity.dms_sent / goals.dms) * 100
  const connectionsProgress = (activity.connections_sent / goals.connections) * 100
  const dmsComplete = activity.dms_sent >= goals.dms
  const connectionsComplete = activity.connections_sent >= goals.connections
  const allGoalsMet = dmsComplete && connectionsComplete

  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 hover:border-primary-200 transition-all shadow-sm hover:shadow-md overflow-hidden">
      {/* Collapsed Header - Always Visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          {/* VA Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {va.full_name?.charAt(0).toUpperCase() || 'V'}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{va.full_name}</h3>
              <p className="text-sm text-gray-500">{va.email}</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {activity.dms_sent}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">DMs</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {activity.connections_sent}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Connections</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activity.connections_accepted}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Accepted</div>
            </div>

            {activity.connections_sent > 0 && (
              <div className="text-center px-4 py-2 bg-primary-50 rounded-lg">
                <div className="text-xl font-bold text-primary-700">
                  {acceptanceRate}%
                </div>
                <div className="text-xs text-primary-600 uppercase tracking-wide">Rate</div>
              </div>
            )}

            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowRemoveModal(true)
              }}
              className="ml-4 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove VA from team"
            >
              Remove
            </button>

            {/* Expand/Collapse Icon */}
            <div className={`ml-4 transition-transform ${expanded ? 'rotate-180' : ''}`}>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex gap-2 mt-4">
          {allGoalsMet && (
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              All Goals Met
            </span>
          )}
          {dmsComplete && !allGoalsMet && (
            <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
              DMs Complete
            </span>
          )}
          {connectionsComplete && !allGoalsMet && (
            <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">
              Connections Complete
            </span>
          )}
        </div>
      </button>

      {/* Expanded Content - VA's Full Dashboard View */}
      {expanded && (
        <div className="border-t-2 border-gray-100 p-6 bg-gray-50 space-y-6">
          <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Read-only view - This is what {va.full_name?.split(' ')[0]} sees on their dashboard
          </div>

          {/* DMs Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Direct Messages</h3>
                <p className="text-sm text-gray-500">Goal: {goals.dms} per day</p>
              </div>
              {dmsComplete && (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-semibold text-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Goal Met!
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${dmsComplete ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-primary-400 to-primary-600'}`}
                  style={{ width: `${Math.min(dmsProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>{activity.dms_sent} sent</span>
                <span>{goals.dms - activity.dms_sent > 0 ? `${goals.dms - activity.dms_sent} to go` : 'Complete!'}</span>
              </div>
            </div>
          </div>

          {/* Connections Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Connection Requests</h3>
                <p className="text-sm text-gray-500">Goal: {goals.connections} per day</p>
              </div>
              {connectionsComplete && (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-semibold text-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Goal Met!
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${connectionsComplete ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`}
                  style={{ width: `${Math.min(connectionsProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>{activity.connections_sent} sent</span>
                <span>{goals.connections - activity.connections_sent > 0 ? `${goals.connections - activity.connections_sent} to go` : 'Complete!'}</span>
              </div>
            </div>
          </div>

          {/* Acceptances Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Connections Accepted</h3>
                <p className="text-sm text-gray-500">Track acceptance rate</p>
              </div>
              {activity.connections_sent > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {acceptanceRate}%
                  </div>
                  <div className="text-xs text-gray-500">Acceptance Rate</div>
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-green-600">
              {activity.connections_accepted}
            </div>
          </div>

          {/* Celebration */}
          {allGoalsMet && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-green-900 mb-2">
                Outstanding Work!
              </h3>
              <p className="text-green-700">
                {va.full_name?.split(' ')[0]} has crushed their daily goals!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Remove {va.full_name}?</h3>
              <p className="text-gray-600">
                This will remove {va.full_name} ({va.email}) from your team. Their historical data will be preserved but they won't appear in your dashboard.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveModal(false)}
                disabled={removing}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {removing ? 'Removing...' : 'Remove VA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
