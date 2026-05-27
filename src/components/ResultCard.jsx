const BADGE_STYLES = {
  Low: 'bg-green-500 text-white',
  Medium: 'bg-yellow-400 text-gray-900',
  High: 'bg-red-500 text-white',
}

export default function ResultCard({ result }) {
  const { impact_level, impact_reason, co2_estimate, alternatives } = result
  const badgeStyle = BADGE_STYLES[impact_level] ?? 'bg-gray-400 text-white'

  return (
    <div className="rounded-2xl border border-green-100 bg-white shadow-md overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Left: impact info */}
        <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${badgeStyle}`}>
              {impact_level.toUpperCase()} IMPACT
            </span>
            <span className="text-sm text-gray-500">{co2_estimate}</span>
          </div>
          <p className="text-gray-700 leading-relaxed">{impact_reason}</p>
        </div>

        {/* Right: alternatives */}
        <div className="w-full sm:w-64 p-6 bg-green-50 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-green-700">Try instead</h3>
          {alternatives.map((alt, i) => (
            <div
              key={i}
              className="rounded-xl border border-green-200 bg-white p-4 border-l-4 border-l-green-500"
            >
              <p className="font-semibold text-gray-800 text-sm">{alt.title}</p>
              <p className="text-green-600 text-xs mt-1">{alt.co2_saving}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
