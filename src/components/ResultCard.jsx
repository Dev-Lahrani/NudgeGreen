const GAUGE_CONFIG = {
  Low:    { percent: 0.33, color: '#1D9E75', track: '#a7f3d0' },
  Medium: { percent: 0.66, color: '#F59E0B', track: '#fde68a' },
  High:   { percent: 1.00, color: '#DC2626', track: '#fecaca' },
}

function ImpactGauge({ level }) {
  const cfg = GAUGE_CONFIG[level] ?? GAUGE_CONFIG.High
  const r = 38
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference * (1 - cfg.percent)

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke={cfg.track} strokeWidth="9" />
        <circle
          data-testid="gauge-arc"
          data-impact={level}
          cx="50" cy="50" r={r}
          fill="none"
          stroke={cfg.color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.9s ease' }}
        />
        <text x="50" y="46" textAnchor="middle" fontSize="12" fontWeight="800" fill={cfg.color} fontFamily="sans-serif">
          {level.toUpperCase()}
        </text>
        <text x="50" y="61" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="sans-serif">
          IMPACT
        </text>
      </svg>
    </div>
  )
}

const CATEGORY_PILL = {
  transport: { icon: '🚗', label: 'Transport' },
  food:      { icon: '🍔', label: 'Food' },
  shopping:  { icon: '🛍️', label: 'Shopping' },
  energy:    { icon: '⚡', label: 'Energy' },
}

export default function ResultCard({ result }) {
  const { impact_level, impact_reason, co2_estimate, alternatives, _category } = result
  const pill = _category ? CATEGORY_PILL[_category] : null

  return (
    <div className="rounded-2xl border border-green-100 bg-white shadow-md overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Left: impact info */}
        <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-green-100 flex flex-col gap-3">
          {pill && (
            <span className="self-center rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700">
              {pill.icon} {pill.label}
            </span>
          )}
          <ImpactGauge level={impact_level} />
          <p className="text-center text-sm font-medium text-gray-500">{co2_estimate}</p>
          <p className="text-gray-700 leading-relaxed text-sm">{impact_reason}</p>
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
