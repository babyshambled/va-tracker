import { useState } from 'react'
import { useHistoricalActivities } from '../../hooks/useHistoricalActivities'
import { useActivityByDate } from '../../hooks/useActivityByDate'

export default function HistoricalActivities({ userId }) {
  const { activities, loading: listLoading, refresh } = useHistoricalActivities(userId, 30)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [editValues, setEditValues] = useState({
    dms_sent: 0,
    connections_sent: 0,
    connections_accepted: 0
  })

  const { activity, loading: activityLoading, setDMs, setConnections, setAccepted } = useActivityByDate(
    userId,
    selectedDate || new Date().toISOString().split('T')[0]
  )

  const handleEditClick = (date, activityData = null) => {
    setSelectedDate(date)
    if (activityData) {
      setEditValues({
        dms_sent: activityData.dms_sent || 0,
        connections_sent: activityData.connections_sent || 0,
        connections_accepted: activityData.connections_accepted || 0
      })
    } else {
      setEditValues({
        dms_sent: 0,
        connections_sent: 0,
        connections_accepted: 0
      })
    }
    setShowEditModal(true)
  }

  const handleSave = async () => {
    await setDMs(parseInt(editValues.dms_sent) || 0)
    await setConnections(parseInt(editValues.connections_sent) || 0)
    await setAccepted(parseInt(editValues.connections_accepted) || 0)

    setShowEditModal(false)
    refresh()
    alert('✅ Activity updated successfully!')
  }

  const handleAddNewDate = () => {
    console.log('🔍 Opening date picker modal')
    setNewDate(new Date().toISOString().split('T')[0]) // Default to today
    setShowDatePicker(true)
  }

  const handleDateSubmit = () => {
    if (!newDate) {
      alert('⚠️ Please select a date')
      return
    }

    console.log('✅ Date selected:', newDate)
    setShowDatePicker(false)
    handleEditClick(newDate)
  }

  if (listLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📅 Activity History</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📅 Activity History</h2>
          <p className="text-gray-600 mt-1">View and edit past activities (last 30 days)</p>
        </div>
        <button
          onClick={handleAddNewDate}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          + Add Past Date
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-gray-600 font-medium">No historical activities yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Start logging your daily work to build your activity history
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((act) => {
            const actDate = new Date(act.activity_date)
            const isToday = act.activity_date === new Date().toISOString().split('T')[0]
            const totalActivity = act.dms_sent + act.connections_sent + act.connections_accepted

            return (
              <div
                key={act.id}
                className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all hover:shadow-md ${
                  isToday
                    ? 'bg-emerald-50 border-emerald-200'
                    : totalActivity === 0
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {actDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </h3>
                    {isToday && (
                      <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        TODAY
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-semibold">DMs Sent</p>
                      <p className="text-2xl font-bold text-emerald-600">{act.dms_sent}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Connections</p>
                      <p className="text-2xl font-bold text-amber-600">{act.connections_sent}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Accepted</p>
                      <p className="text-2xl font-bold text-green-600">{act.connections_accepted}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick(act.activity_date, act)}
                  className="ml-6 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  ✏️ Edit
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">✏️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Edit Activity</h3>
              <p className="text-gray-600">
                {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {activityLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    DMs Sent
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editValues.dms_sent}
                    onChange={(e) => setEditValues({ ...editValues, dms_sent: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition text-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Connections Sent
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editValues.connections_sent}
                    onChange={(e) => setEditValues({ ...editValues, connections_sent: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition text-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Connections Accepted
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editValues.connections_accepted}
                    onChange={(e) => setEditValues({ ...editValues, connections_accepted: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition text-lg font-semibold"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedDate(null)
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center mt-4">
              💡 Changes will be reflected in your activity history immediately
            </p>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Past Date Activity</h3>
              <p className="text-gray-600">
                Select a date to log past activity
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-lg font-semibold"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 You can only add activities for past or current dates
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDatePicker(false)
                    setNewDate('')
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDateSubmit}
                  disabled={!newDate}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
