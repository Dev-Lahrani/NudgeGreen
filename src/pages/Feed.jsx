import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFeed, nudgeDecision, markNotificationsRead } from '../utils/api'

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const IMPACT_COLOR = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-500',
}

export default function Feed({ onNotificationsRead }) {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [nudgedIds, setNudgedIds] = useState(new Set())
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    getFeed()
      .then(setItems)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
    markNotificationsRead().catch(() => {})
    onNotificationsRead?.()
  }, [onNotificationsRead])

  const handleNudge = useCallback(async (decisionId) => {
    try {
      await nudgeDecision(decisionId)
      setNudgedIds((prev) => new Set([...prev, decisionId]))
    } catch (err) {
      console.error('Nudge failed:', err)
    }
  }, [])

  return (
    <div className="min-h-screen bg-green-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-green-700 hover:text-green-900 text-sm font-medium"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-green-800">🌍 Friends Feed</h1>
        </div>

        {loading && (
          <p className="text-center text-sm text-gray-400 py-12">Loading…</p>
        )}

        {!loading && fetchError && (
          <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center">
            <p className="text-3xl mb-3">⚠️</p>
            <p className="text-sm font-semibold text-gray-700">Could not load feed</p>
            <p className="text-xs text-gray-400 mt-1">Check your connection and try again.</p>
          </div>
        )}

        {!loading && !fetchError && items.length === 0 && (
          <div className="rounded-2xl border border-green-100 bg-white px-6 py-12 text-center">
            <p className="text-3xl mb-3">🌿</p>
            <p className="text-sm font-semibold text-gray-700">No activity yet</p>
            <p className="text-xs text-gray-400 mt-1 leading-snug">
              Add friends from the Leaderboard to see their eco-decisions here.
            </p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <ol className="space-y-3">
            {items.map((item) => {
              const nudged = nudgedIds.has(item.id)
              const impactColor = IMPACT_COLOR[item.impact_level?.toLowerCase()] ?? 'text-gray-400'
              const co2Part = item.co2_kg > 0
                ? ` · saved ${item.co2_kg.toFixed(2)} kg CO₂`
                : ''

              return (
                <li
                  key={item.id}
                  className="rounded-2xl border border-green-100 bg-white px-4 py-3.5 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                    {(item.display_name?.[0] ?? '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">
                      <span className="font-semibold">{item.display_name}</span>
                      {' chose '}
                      <span className="italic">{item.decision_text}</span>
                    </p>
                    <p className={`text-xs mt-0.5 ${impactColor}`}>
                      {item.impact_level ?? 'Unknown impact'}
                      {co2Part}
                      {' · '}
                      {timeAgo(item.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNudge(item.id)}
                    disabled={nudged}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      nudged
                        ? 'bg-green-100 text-green-600 cursor-default'
                        : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                    }`}
                  >
                    {nudged ? 'Nudged ✓' : '👋 Nudge'}
                  </button>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
