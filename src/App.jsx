import { useState, useCallback, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import InputForm from './components/InputForm'
import LoadingState from './components/LoadingState'
import ResultCard from './components/ResultCard'
import CarbonStoryPanel from './components/CarbonStoryPanel'
import HistoryFeed from './components/HistoryFeed'
import CityModal from './components/CityModal'
import AuthModal from './components/AuthModal'
import LeaderboardModal from './components/LeaderboardModal'
import BadgeToastContainer from './components/BadgeToast'
import ProactiveNudge from './components/ProactiveNudge'
import Dashboard from './pages/Dashboard'
import Feed from './pages/Feed'
import { queryOllama } from './utils/ollama'
import { getSavedCity, saveCity, cities } from './data/cities'
import { getSavedToken, saveToken, clearAuth, logDecision, getNotifications } from './utils/api'

const USER_ID_KEY = 'nudgegreen_user_id'

function getSavedUserId() {
  return localStorage.getItem(USER_ID_KEY) ?? null
}

function parseCo2(estimate) {
  const match = String(estimate).match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}

export default function App() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [sessionCo2, setSessionCo2] = useState(0)
  const [decisionCount, setDecisionCount] = useState(0)
  const [history, setHistory] = useState([])
  const [city, setCity] = useState(() => getSavedCity())
  const [userId, setUserId] = useState(() => getSavedUserId())
  const [token, setToken] = useState(() => getSavedToken())
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [toasts, setToasts] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const notifInterval = useRef(null)

  const isAuthed = !!(userId && token)

  const fetchNotifCount = useCallback(() => {
    getNotifications()
      .then(({ unread_count }) => setNotifCount(unread_count ?? 0))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isAuthed) return
    fetchNotifCount()
    notifInterval.current = setInterval(fetchNotifCount, 60_000)
    return () => clearInterval(notifInterval.current)
  }, [isAuthed, fetchNotifCount])

  const handleNotificationsRead = useCallback(() => {
    setNotifCount(0)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  function addToasts(badgeIds) {
    if (!badgeIds?.length) return
    setToasts((prev) => [
      ...prev,
      ...badgeIds.map((badgeId) => ({ id: `${badgeId}-${Date.now()}`, badgeId })),
    ])
  }

  function handleAuth({ user_id, token: newToken, cityId }) {
    localStorage.setItem(USER_ID_KEY, user_id)
    saveToken(newToken)
    setUserId(user_id)
    setToken(newToken)
    if (cityId) {
      const found = cities.find((c) => c.id === cityId)
      if (found) { saveCity(found.id); setCity(found) }
    }
  }

  function handleLogout() {
    clearAuth()
    clearInterval(notifInterval.current)
    setUserId(null)
    setToken(null)
    setCity(null)
    setResult(null)
    setHistory([])
    setSessionCo2(0)
    setDecisionCount(0)
    setToasts([])
    setNotifCount(0)
    navigate('/')
  }

  function handleCitySelect(selectedCity) {
    saveCity(selectedCity.id)
    setCity(selectedCity)
  }

  async function handleSubmit(decision) {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const data = await queryOllama(decision, city)
      setResult(data)
      const co2 = parseCo2(data.co2_estimate)
      setSessionCo2((prev) => prev + co2)
      setDecisionCount((prev) => prev + 1)
      setHistory((prev) => [
        { decision, impact_level: data.impact_level, co2_estimate: data.co2_estimate },
        ...prev,
      ])
      if (userId) {
        logDecision({
          decision_text: decision,
          category: data._category ?? null,
          impact_level: data.impact_level ?? null,
          co2_kg: co2 > 0 ? co2 : null,
        })
          .then(({ new_badges }) => addToasts(new_badges))
          .catch(() => {})
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthed) return <AuthModal onAuth={handleAuth} />

  return (
    <>
      <BadgeToastContainer toasts={toasts} onDismiss={dismissToast} />
      <Routes>
        <Route
          path="/dashboard"
          element={<Dashboard userId={userId} onLogout={handleLogout} />}
        />
        <Route
          path="/feed"
          element={<Feed onNotificationsRead={handleNotificationsRead} />}
        />
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-green-50">
              {!city && <CityModal onSelect={handleCitySelect} />}
              {showLeaderboard && (
                <LeaderboardModal
                  currentUserId={userId}
                  onClose={() => setShowLeaderboard(false)}
                />
              )}

              <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
                <div className="mb-8 text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold text-green-800 tracking-tight">🌿 NudgeGreen</h1>
                  <p className="mt-2 text-gray-500 text-sm sm:text-base">
                    Find out the environmental impact of your daily decisions
                  </p>

                  {/* ── Desktop nav ── */}
                  <div className="hidden sm:flex mt-3 items-center justify-center gap-2 flex-wrap">
                    {city && (
                      <button
                        onClick={() => setCity(null)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white px-3 py-1 text-xs text-green-700 hover:border-green-400 transition-colors"
                      >
                        📍 {city.name}<span className="text-gray-400">· change</span>
                      </button>
                    )}
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white px-3 py-1 text-xs text-green-700 hover:border-green-400 transition-colors">
                      📊 Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/feed')}
                      className="relative inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white px-3 py-1 text-xs text-green-700 hover:border-green-400 transition-colors"
                    >
                      🌍 Feed
                      {notifCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5">
                          {notifCount > 9 ? '9+' : notifCount}
                        </span>
                      )}
                    </button>
                    <button onClick={() => setShowLeaderboard(true)} className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-white px-3 py-1 text-xs text-yellow-700 hover:border-yellow-400 transition-colors">
                      🏆 Leaderboard
                    </button>
                    <button onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500 hover:border-gray-400 transition-colors">
                      Log out
                    </button>
                  </div>

                  {/* ── Mobile hamburger ── */}
                  <div className="sm:hidden mt-3 relative inline-block">
                    <button
                      onClick={() => setMenuOpen((o) => !o)}
                      className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-1.5 text-sm font-semibold text-green-700"
                    >
                      <span className="text-base leading-none">{menuOpen ? '✕' : '☰'}</span>
                      Menu
                      {notifCount > 0 && (
                        <span className="min-w-[1.1rem] h-[1.1rem] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5">
                          {notifCount > 9 ? '9+' : notifCount}
                        </span>
                      )}
                    </button>

                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 z-40 mt-2 w-52 rounded-2xl border border-green-100 bg-white shadow-xl overflow-hidden">
                          {city && (
                            <button
                              onClick={() => { setCity(null); setMenuOpen(false) }}
                              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-green-700 hover:bg-green-50 border-b border-gray-50"
                            >
                              📍 <span className="truncate">{city.name} · change</span>
                            </button>
                          )}
                          <button
                            onClick={() => { navigate('/dashboard'); setMenuOpen(false) }}
                            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-green-700 hover:bg-green-50 border-b border-gray-50"
                          >
                            📊 Dashboard
                          </button>
                          <button
                            onClick={() => { navigate('/feed'); setMenuOpen(false) }}
                            className="flex w-full items-center justify-between px-4 py-3 text-sm text-green-700 hover:bg-green-50 border-b border-gray-50"
                          >
                            <span className="flex items-center gap-2.5">🌍 Feed</span>
                            {notifCount > 0 && (
                              <span className="min-w-[1.25rem] h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                                {notifCount > 9 ? '9+' : notifCount}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => { setShowLeaderboard(true); setMenuOpen(false) }}
                            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-yellow-700 hover:bg-yellow-50 border-b border-gray-50"
                          >
                            🏆 Leaderboard
                          </button>
                          <button
                            onClick={() => { handleLogout(); setMenuOpen(false) }}
                            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50"
                          >
                            ↩ Log out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <ProactiveNudge key={userId} />

                <CarbonStoryPanel totalCo2={sessionCo2} decisionCount={decisionCount} />

                <div className="mb-8">
                  <InputForm onSubmit={handleSubmit} loading={loading} />
                </div>

                {loading && <LoadingState />}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {result && !loading && <ResultCard result={result} />}

                {result && !loading && result.impact_level?.toLowerCase() === 'high' && (
                  <div className="mt-3 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm">
                    <span className="text-lg shrink-0">🌳</span>
                    <p className="text-green-800 leading-snug">
                      <span className="font-semibold">Offset this decision</span> — plant 1 tree (~21 kg CO₂/year) via local NGOs.{' '}
                      <a
                        href="https://www.svanature.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-green-600 font-medium"
                      >
                        svanature.org →
                      </a>
                    </p>
                  </div>
                )}

                <HistoryFeed entries={history} />
              </div>
            </div>
          }
        />
      </Routes>
    </>
  )
}
