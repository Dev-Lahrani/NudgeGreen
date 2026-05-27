import { useEffect, useState } from 'react'
import { getLeaderboard } from '../utils/api'

export default function LeaderboardModal({ currentUserId, onClose }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getLeaderboard()
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-green-800">🏆 Weekly Leaderboard</h2>
            <p className="text-xs text-gray-400 mt-0.5">Top CO₂ savers this week</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {loading && <p className="text-sm text-gray-400 text-center py-8">Loading…</p>}
          {error && <p className="text-sm text-red-500 text-center py-8">{error}</p>}
          {!loading && !error && rows.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No data yet — be the first!</p>
          )}
          {!loading && !error && rows.length > 0 && (
            <ol className="space-y-2">
              {rows.map((row, i) => {
                const isMe = row.id === currentUserId
                return (
                  <li
                    key={row.id}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                      isMe ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <span className="w-6 text-center text-sm font-bold text-gray-400">
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
