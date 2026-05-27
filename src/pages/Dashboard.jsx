import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { getDashboard, getBadges } from '../utils/api'
import { BADGE_CATALOG } from '../data/badges'

// ── helpers ──────────────────────────────────────────────────────────────────

function fillWeek(rows) {
  const map = {}
  rows.forEach((r) => { map[String(r.day).slice(0, 10)] = r.co2 })

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })
    return { label, co2: map[key] ?? 0 }
  })
}

const CATEGORY_META = {
  transport: { label: 'Transport', color: '#16a34a' },
  food:      { label: 'Food',      color: '#f59e0b' },
  shopping:  { label: 'Shopping',  color: '#3b82f6' },
  energy:    { label: 'Energy',    color: '#f97316' },
}
const FALLBACK_COLOR = '#94a3b8'

function categoryColor(cat) { return CATEGORY_META[cat]?.color ?? FALLBACK_COLOR }
function categoryLabel(cat) {
  return CATEGORY_META[cat]?.label ?? (cat ? cat[0].toUpperCase() + cat.slice(1) : 'Other')
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, icon, color }) {
  return (
    <div className={`rounded-2xl bg-white border ${color} p-5 flex flex-col gap-1 shadow-sm`}>
      <span className="text-xl">{icon}</span>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      <p className="text-xs text-gray-500 leading-snug">
        {label}{unit && <span className="text-gray-400"> · {unit}</span>}
      </p>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-white border border-green-100 shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-600 mb-0.5">{label}</p>
      <p className="text-green-700 font-bold">{payload[0].value.toFixed(2)} kg CO₂</p>
    </div>
  )
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700">{categoryLabel(name)}</p>
      <p className="text-gray-500">{parseFloat(value).toFixed(2)} kg CO₂</p>
    </div>
  )
}

function BadgeCard({ badge, earned, earnedAt }) {
  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col items-center gap-2 text-center transition-all ${
        earned
          ? 'bg-white border-green-200 shadow-sm'
          : 'bg-gray-50 border-gray-100 opacity-50'
      }`}
    >
      <span className={`text-3xl ${earned ? '' : 'grayscale'}`}>{badge.icon}</span>
      <p className={`text-sm font-bold leading-tight ${earned ? 'text-gray-800' : 'text-gray-400'}`}>
        {badge.name}
      </p>
      {earned ? (
        <p className="text-xs text-green-600 font-medium">
          {new Date(earnedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </p>
      ) : (
        <p className="text-xs text-gray-400 leading-snug">{badge.hint}</p>
      )}
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function Dashboard({ userId, onLogout }) {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getDashboard(), getBadges()])
      .then(([dashData, badgeData]) => { setData(dashData); setBadges(badgeData) })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  const weekData = data ? fillWeek(data.daily_co2) : []
  const donutData = data
    ? data.by_category.map((r) => ({ name: r.category, value: r.co2 }))
    : []
  const hasDonut = donutData.some((d) => d.value > 0)

  const badgeMap = new Map(badges.map((b) => [b.badge_id, b]))
  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <div className="min-h-screen bg-green-50">
      <div className="mx-auto max-w-3xl px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-800 tracking-tight">📊 Your Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Your personal CO₂ footprint at a glance</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="rounded-full border border-green-200 bg-white px-4 py-1.5 text-xs font-semibold text-green-700 hover:border-green-400 transition-colors"
            >
              ← Home
            </button>
            <button
              onClick={onLogout}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-500 hover:border-gray-400 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        {loading && <p className="text-center text-gray-400 py-20 text-sm">Loading your data…</p>}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard icon="🗓️" label="Total Decisions" value={data.stats.total_decisions} color="border-green-100" />
              <StatCard icon="💨" label="CO₂ Generated" value={data.stats.total_co2.toFixed(1)} unit="kg" color="border-red-100" />
              <StatCard icon="🌱" label="CO₂ Saved" value={data.stats.total_co2_saved.toFixed(1)} unit="kg" color="border-emerald-100" />
              <StatCard icon="🔥" label="Current Streak" value={`${data.stats.streak}d`} color="border-orange-100" />
            </div>

            {/* ── Line chart ── */}
            <div className="rounded-2xl bg-white border border-green-100 shadow-sm p-6 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-5">
                Daily CO₂ — Last 7 Days
              </p>
              {weekData.every((d) => d.co2 === 0) ? (
                <p className="text-sm text-gray-400 text-center py-10">No decisions logged yet this week.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={weekData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}kg`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="co2" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: '#16a34a', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
              {(() => {
                const weeklyCo2 = weekData.reduce((sum, d) => sum + d.co2, 0)
                if (weeklyCo2 <= 0) return null
                const trees = Math.ceil(weeklyCo2 / 21)
                return (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-2.5">
                    <span className="text-base">🌳</span>
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">To offset your week: {trees} {trees === 1 ? 'tree' : 'trees'}</span>
                      <span className="text-green-600 ml-1">
                        — plant via{' '}
                        <a
                          href="https://www.svanature.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-green-700 font-medium"
                        >
                          svanature.org
                        </a>
                      </span>
                    </p>
                  </div>
                )
              })()}
            </div>

            {/* ── Donut chart ── */}
            <div className="rounded-2xl bg-white border border-green-100 shadow-sm p-6 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-5">
                CO₂ by Category
              </p>
              {!hasDonut ? (
                <p className="text-sm text-gray-400 text-center py-10">Not enough categorised data yet.</p>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ResponsiveContainer width={220} height={220}>
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                        {donutData.map((entry) => (
                          <Cell key={entry.name} fill={categoryColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip content={<DonutTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="flex flex-col gap-2.5 text-sm">
                    {donutData.map((entry) => (
                      <li key={entry.name} className="flex items-center gap-2.5">
                        <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ background: categoryColor(entry.name) }} />
                        <span className="text-gray-700 font-medium w-20">{categoryLabel(entry.name)}</span>
                        <span className="text-gray-400">{entry.value.toFixed(2)} kg</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ── Badges ── */}
            <div className="rounded-2xl bg-white border border-green-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-green-700">
                  Badges
                </p>
                <span className="text-xs font-semibold text-gray-400">
                  {earnedCount} / {BADGE_CATALOG.length} earned
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BADGE_CATALOG.map((badge) => {
                  const entry = badgeMap.get(badge.id)
                  return (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      earned={entry?.earned ?? false}
                      earnedAt={entry?.earned_at ?? null}
                    />
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
