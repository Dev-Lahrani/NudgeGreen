const BADGE = {
  Low:    'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  High:   'bg-red-100 text-red-700',
}

export default function HistoryFeed({ entries }) {
  if (!entries.length) return null

  return (
    <div className="mt-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-green-700 mb-3">
        Today's Decisions
      </h2>
      <div className="flex flex-col gap-2">
        {entries.map((entry, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl bg-white border border-green-100 px-4 py-3 shadow-sm"
          >
            <p className="flex-1 text-sm text-gray-700 truncate">{entry.decision}</p>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[entry.impact_level] ?? 'bg-gray-100 text-gray-600'}`}>
              {entry.impact_level}
            </span>
            <span className="shrink-0 text-xs text-gray-400 font-medium w-24 text-right">
              {entry.co2_estimate}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
