import { useState } from 'react'

export default function DisplayNameModal({ city, onSubmit }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    await onSubmit(trimmed)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl mx-4">
        <h2 className="text-2xl font-bold text-green-800 mb-1">One last thing</h2>
        <p className="text-sm text-gray-500 mb-6">
          Pick a display name for the leaderboard — your city is already set to{' '}
          <span className="font-medium text-green-700">{city}</span>.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. EcoWarrior99"
            maxLength={100}
            autoFocus
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="w-full rounded-xl bg-green-700 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving…' : 'Join the leaderboard →'}
          </button>
        </form>
      </div>
    </div>
  )
}
