const INDIAN_DAILY_AVG_KG = 11

// ── Tree states ────────────────────────────────────────────────────────────
function treeState(totalCo2) {
  const ratio = totalCo2 / INDIAN_DAILY_AVG_KG
  if (ratio < 0.27) return 'thriving'
  if (ratio < 0.63) return 'moderate'
  return 'wilting'
}

function TreeSVG({ state }) {
  const configs = {
    thriving: {
      rotate: 0,
      trunkFill: '#92400e',
      canopy1: '#16a34a',
      canopy2: '#22c55e',
      canopy3: '#4ade80',
      leaves: true,
    },
    moderate: {
      rotate: 8,
      trunkFill: '#a16207',
      canopy1: '#65a30d',
      canopy2: '#84cc16',
      canopy3: '#bef264',
      leaves: false,
    },
    wilting: {
      rotate: 20,
      trunkFill: '#78350f',
      canopy1: '#92400e',
      canopy2: '#b45309',
      canopy3: '#d97706',
      leaves: false,
    },
  }
  const c = configs[state]

  return (
    <svg
      viewBox="0 0 80 110"
      width="72"
      height="90"
      style={{ transition: 'all 0.8s ease', overflow: 'visible' }}
      aria-label={`Tree — ${state}`}
    >
      <g
        style={{
          transformOrigin: '40px 100px',
          transform: `rotate(${c.rotate}deg)`,
          transition: 'transform 0.9s ease',
        }}
      >
        {/* Trunk */}
        <rect x="34" y="68" width="12" height="36" rx="3" fill={c.trunkFill}
          style={{ transition: 'fill 0.8s ease' }} />

        {/* Roots */}
        <path d="M34 100 Q28 106 22 104" stroke={c.trunkFill} strokeWidth="3"
          fill="none" strokeLinecap="round" style={{ transition: 'stroke 0.8s ease' }} />
        <path d="M46 100 Q52 106 58 104" stroke={c.trunkFill} strokeWidth="3"
          fill="none" strokeLinecap="round" style={{ transition: 'stroke 0.8s ease' }} />

        {/* Back canopy layer */}
        <ellipse cx="40" cy="52" rx="26" ry="22" fill={c.canopy1}
          style={{ transition: 'fill 0.8s ease' }} />

        {/* Mid canopy */}
        <ellipse cx="26" cy="44" rx="18" ry="16" fill={c.canopy2}
          style={{ transition: 'fill 0.8s ease' }} />
        <ellipse cx="54" cy="44" rx="18" ry="16" fill={c.canopy2}
          style={{ transition: 'fill 0.8s ease' }} />

        {/* Front/top canopy */}
        <ellipse cx="40" cy="32" rx="22" ry="22" fill={c.canopy2}
          style={{ transition: 'fill 0.8s ease' }} />
        <ellipse cx="40" cy="24" rx="16" ry="16" fill={c.canopy3}
          style={{ transition: 'fill 0.8s ease' }} />

        {/* Leaf sparkles on thriving */}
        {c.leaves && (
          <>
            <circle cx="22" cy="28" r="5" fill={c.canopy3} />
            <circle cx="58" cy="32" r="4" fill={c.canopy3} />
            <circle cx="40" cy="10" r="6" fill={c.canopy3} />
          </>
        )}
      </g>
    </svg>
  )
}

// ── Relatable equivalent ───────────────────────────────────────────────────
function getEquivalent(totalCo2) {
  if (totalCo2 <= 0) return null

  // Driving equivalent always most universally understood
  const km = totalCo2 / 0.21
  if (km >= 1) {
    return `Your choices today equal driving ${km.toFixed(1)} km in a petrol car`
  }
  // Sub-1km: phone charges
  const charges = Math.round(totalCo2 / 0.005)
  if (charges >= 1) {
    return `Your choices today equal charging your phone ${charges} times`
  }
  return `Your footprint so far: ${(totalCo2 * 1000).toFixed(0)} g CO₂`
}

// ── Main component ─────────────────────────────────────────────────────────
export default function CarbonStoryPanel({ totalCo2, decisionCount }) {
  if (decisionCount < 2) return null

  const state = treeState(totalCo2)
  const equivalent = getEquivalent(totalCo2)
  const progressPct = Math.min((totalCo2 / INDIAN_DAILY_AVG_KG) * 100, 100)

  const stateLabel = {
    thriving: 'Low footprint',
    moderate: 'Moderate footprint',
    wilting: 'High footprint',
  }[state]

  const stateColor = {
    thriving: 'text-green-600',
    moderate: 'text-yellow-600',
    wilting: 'text-red-500',
  }[state]

  const barColor = {
    thriving: 'bg-green-500',
    moderate: 'bg-yellow-400',
    wilting: 'bg-red-500',
  }[state]

  return (
    <div className="rounded-2xl border border-green-100 bg-white shadow-sm p-5 mb-6">
      <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-4">
        Your Carbon Story
      </p>

      <div className="flex items-center gap-5">
        {/* Tree */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <TreeSVG state={state} />
          <span className={`text-xs font-semibold ${stateColor}`}>{stateLabel}</span>
        </div>

        {/* Right side */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Equivalent line */}
          {equivalent && (
            <p className="text-sm font-semibold text-gray-700 leading-snug">
              {equivalent}
            </p>
          )}

          {/* Progress bar vs Indian average */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">vs avg Indian daily footprint</span>
              <span className="text-xs font-bold text-gray-600">
                {totalCo2.toFixed(1)} / {INDIAN_DAILY_AVG_KG} kg CO₂
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {progressPct < 100
                ? `${(100 - progressPct).toFixed(0)}% below average`
                : 'Above daily average'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
