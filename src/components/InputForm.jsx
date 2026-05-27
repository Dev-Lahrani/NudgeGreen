import { useState } from 'react'

const CHIPS = [
  { label: '🛵 Ordering Zomato', value: 'Ordering Zomato food delivery' },
  { label: '🚗 Booking a cab', value: 'Booking a cab via Uber or Ola' },
  { label: '🛍️ Same-day delivery', value: 'Ordering same-day delivery from Amazon' },
  { label: '☕ Buying a coffee cup', value: 'Buying a disposable coffee cup' },
]

export default function InputForm({ onSubmit, loading }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onSubmit(trimmed)
  }

  function handleChip(chipValue) {
    setValue(chipValue)
    onSubmit(chipValue)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={loading}
        placeholder="e.g. ordering Zomato delivery, driving to work, buying a plastic bottle..."
        className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-gray-800 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 disabled:opacity-50 resize-none"
      />
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            disabled={loading}
            onClick={() => handleChip(chip.value)}
            className="rounded-full border border-green-200 bg-white px-3 py-1.5 text-sm text-green-700 hover:bg-green-50 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {chip.label}
          </button>
        ))}
      </div>
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="self-end rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {loading ? 'Analyzing...' : 'Check Impact'}
      </button>
    </form>
  )
}
