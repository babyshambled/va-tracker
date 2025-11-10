import { useActivities } from '../../hooks/useActivities'
import UrgentContacts from './UrgentContacts'
import HistoricalActivities from './HistoricalActivities'

export default function VADashboard({ user, profile }) {
  const {
    todayActivity,
    goals,
    loading,
    incrementDMs,
    incrementConnections,
    incrementAccepted,
    decrementDMs,
    decrementConnections,
    decrementAccepted
  } = useActivities(user.id)

  if (loading || !todayActivity) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <div className="text-lg text-gray-600">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  const dmsProgress = (todayActivity.dms_sent / goals.dms) * 100
  const connectionsProgress = (todayActivity.connections_sent / goals.connections) * 100
  const dmsComplete = todayActivity.dms_sent >= goals.dms
  const connectionsComplete = todayActivity.connections_sent >= goals.connections
  const allGoalsMet = dmsComplete && connectionsComplete

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-white">
          Welcome back, {profile.full_name}! 👋
        </h1>
        <p className="text-emerald-50">
          {allGoalsMet
            ? "🎉 Amazing! You've hit all your goals today!"
            : "Let's crush those LinkedIn goals today!"}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
            DMs Sent
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {todayActivity.dms_sent}
            <span className="text-lg text-gray-400 ml-2">/ {goals.dms}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Connections Sent
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {todayActivity.connections_sent}
            <span className="text-lg text-gray-400 ml-2">/ {goals.connections}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Accepted
          </div>
          <div className="text-4xl font-bold text-green-600">
            {todayActivity.connections_accepted}
          </div>
        </div>
      </div>

      {/* DMs Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Direct Messages</h3>
            <p className="text-sm text-gray-500">Goal: {goals.dms} per day</p>
          </div>
          {dmsComplete && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-semibold">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Goal Met!
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${dmsComplete ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`}
              style={{ width: `${Math.min(dmsProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{todayActivity.dms_sent} sent</span>
            <span>{goals.dms - todayActivity.dms_sent > 0 ? `${goals.dms - todayActivity.dms_sent} to go` : 'Complete!'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={decrementDMs}
            disabled={todayActivity.dms_sent === 0}
            className="w-16 h-16 rounded-xl border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-2xl font-bold text-gray-600 hover:text-red-600"
          >
            −
          </button>
          <button
            onClick={incrementDMs}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xl py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-100"
          >
            + Log DM
          </button>
        </div>
      </div>

      {/* Connections Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Connection Requests</h3>
            <p className="text-sm text-gray-500">Goal: {goals.connections} per day</p>
          </div>
          {connectionsComplete && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-semibold">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Goal Met!
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${connectionsComplete ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`}
              style={{ width: `${Math.min(connectionsProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{todayActivity.connections_sent} sent</span>
            <span>{goals.connections - todayActivity.connections_sent > 0 ? `${goals.connections - todayActivity.connections_sent} to go` : 'Complete!'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={decrementConnections}
            disabled={todayActivity.connections_sent === 0}
            className="w-16 h-16 rounded-xl border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-2xl font-bold text-gray-600 hover:text-red-600"
          >
            −
          </button>
          <button
            onClick={incrementConnections}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xl py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-100"
          >
            + Log Connection
          </button>
        </div>
      </div>

      {/* Acceptances Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Connections Accepted</h3>
            <p className="text-sm text-gray-500">Track your acceptance rate</p>
          </div>
          {todayActivity.connections_sent > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((todayActivity.connections_accepted / todayActivity.connections_sent) * 100)}%
              </div>
              <div className="text-xs text-gray-500">Acceptance Rate</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={decrementAccepted}
            disabled={todayActivity.connections_accepted === 0}
            className="w-16 h-16 rounded-xl border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-2xl font-bold text-gray-600 hover:text-red-600"
          >
            −
          </button>
          <button
            onClick={incrementAccepted}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-xl py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-100"
          >
            + Connection Accepted
          </button>
        </div>
      </div>

      {/* Celebration */}
      {allGoalsMet && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">
            Outstanding Work!
          </h3>
          <p className="text-green-700">
            You've crushed your daily goals. Keep up the amazing work!
          </p>
        </div>
      )}

      {/* Urgent Contacts */}
      <UrgentContacts userId={user.id} />

      {/* Historical Activities */}
      <HistoricalActivities userId={user.id} />
    </div>
  )
}
