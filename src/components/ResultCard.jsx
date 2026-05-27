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

const FLIGHT_CO2_KG = 0.15
const SCALE_POPULATION = 1_000_000

function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString()
}

function computeScaleStat(result) {
  // Prefer the precise db figure; fall back to parsing the estimate string
  const co2Kg = result._matched?.co2_kg
    ?? parseFloat(String(result.co2_estimate).match(/[\d.]+/)?.[0] ?? '0')
  if (!co2Kg) return null
  const totalKg = co2Kg * SCALE_POPULATION
  const tonnes = Math.round(totalKg / 1000)
  const flights = Math.round(totalKg / FLIGHT_CO2_KG)
  return { tonnes, flights }
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
  const scale = computeScaleStat(result)

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
          {scale && (
            <p className="text-xs text-gray-400 leading-relaxed border-t border-green-50 pt-3">
              🌍 If 1M people made this choice daily, that's{' '}
              <span className="font-semibold text-gray-500">{formatNumber(scale.tonnes)} tonnes</span> of CO₂ —
              equivalent to{' '}
              <span className="font-semibold text-gray-500">{formatNumber(scale.flights)} flights</span> from Mumbai to Delhi.
            </p>
          )}
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
              {alt.nudgeScore !== undefined && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 font-medium">Smart Score</span>
                    <span className="text-xs font-bold text-green-700">{alt.nudgeScore}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-green-100">
                    <div
                      className="h-1.5 rounded-full bg-green-500 transition-all duration-700"
                      style={{ width: `${alt.nudgePercent ?? 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
