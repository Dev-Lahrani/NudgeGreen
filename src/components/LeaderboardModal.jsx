import { useCallback, useEffect, useState } from 'react'
import { getLeaderboard, sendFriendRequest, acceptFriend, getFriendRequests } from '../utils/api'

function AcceptRequestButton({ requesterId, onAccept }) {
  const [busy, setBusy] = useState(false)

  async function handleAccept() {
    setBusy(true)
    try {
      await acceptFriend(requesterId)
      onAccept(requesterId)
    } catch (err) {
      console.error('Accept failed:', err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleAccept}
      disabled={busy}
      className="shrink-0 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
    >
      {busy ? '…' : 'Accept'}
    </button>
  )
}

function FriendButton({ row, currentUserId, onAction }) {
  const [busy, setBusy] = useState(false)

  if (row.id === currentUserId) return null

  async function handleRequest() {
    setBusy(true)
    try {
      await sendFriendRequest(row.id)
      onAction(row.id, 'pending', 'outgoing')
    } catch (err) {
      console.error('Friend request failed:', err)
    } finally {
      setBusy(false)
    }
  }

  async function handleAccept() {
    setBusy(true)
    try {
      await acceptFriend(row.id)
      onAction(row.id, 'accepted', null)
    } catch (err) {
      console.error('Accept friend failed:', err)
    } finally {
      setBusy(false)
    }
  }

  if (row.friendship_status === 'accepted') {
    return (
      <span className="text-xs font-medium text-green-600 shrink-0">Friends ✓</span>
    )
  }

  if (row.friendship_status === 'pending' && row.friendship_dir === 'outgoing') {
    return (
      <span className="text-xs text-gray-400 shrink-0">Requested</span>
    )
  }

  if (row.friendship_status === 'pending' && row.friendship_dir === 'incoming') {
    return (
      <button
        onClick={handleAccept}
        disabled={busy}
        className="shrink-0 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {busy ? '…' : 'Accept'}
      </button>
    )
  }

  return (
    <button
      onClick={handleRequest}
      disabled={busy}
      className="shrink-0 rounded-full border border-green-300 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50 transition-colors"
    >
      {busy ? '…' : '+ Add'}
    </button>
  )
}

export default function LeaderboardModal({ currentUserId, onClose }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [requests, setRequests] = useState([])

  useEffect(() => {
    getLeaderboard()
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
    getFriendRequests().then(setRequests).catch(() => {})
  }, [])

  const handleFriendAction = useCallback((userId, newStatus, newDir) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === userId
          ? { ...r, friendship_status: newStatus, friendship_dir: newDir }
          : r
      )
    )
  }, [])

  const handleAcceptRequest = useCallback((requesterId) => {
    setRequests((prev) => prev.filter((r) => r.id !== requesterId))
    handleFriendAction(requesterId, 'accepted', null)
  }, [handleFriendAction])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-green-800">🏆 Weekly Leaderboard</h2>
            <p className="text-xs text-gray-400 mt-0.5">Top CO₂ savers this week</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="sm:hidden flex justify-center pt-1 pb-0 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1 -webkit-overflow-scrolling-touch">
          {requests.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Friend Requests
              </p>
              <ul className="space-y-2">
                {requests.map((req) => (
                  <li key={req.id} className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{req.display_name}</p>
                      <p className="text-xs text-gray-400">{req.city}</p>
                    </div>
                    <AcceptRequestButton requesterId={req.id} onAccept={handleAcceptRequest} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {loading && <p className="text-sm text-gray-400 text-center py-8">Loading…</p>}
          {error && <p className="text-sm text-red-500 text-center py-8">{error}</p>}
          {!loading && !error && rows.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No data yet — be the first!</p>
          )}
          {!loading && !error && rows.length > 0 && (
            <ol className="space-y-2 pb-2">
              {rows.map((row, i) => {
                const isMe = row.id === currentUserId
                return (
                  <li
                    key={row.id}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                      isMe ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <span className="w-6 text-center text-sm font-bold text-gray-400 shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {row.display_name}
                        {isMe && (
                          <span className="ml-2 text-xs font-normal text-green-600">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">{row.city}</p>
                    </div>
                    <span className="text-sm font-bold text-green-700 shrink-0">
                      {parseFloat(row.total_co2_saved).toFixed(1)} kg
                    </span>
                    <FriendButton
                      row={row}
                      currentUserId={currentUserId}
                      onAction={handleFriendAction}
                    />
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
