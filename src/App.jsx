import { useState } from 'react'
import InputForm from './components/InputForm'
import LoadingState from './components/LoadingState'
import ResultCard from './components/ResultCard'
import CarbonStoryPanel from './components/CarbonStoryPanel'
import HistoryFeed from './components/HistoryFeed'
import CityModal from './components/CityModal'
import { queryOllama } from './utils/ollama'
import { getSavedCity, saveCity } from './data/cities'

function parseCo2(estimate) {
  const match = String(estimate).match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}

export default function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [sessionCo2, setSessionCo2] = useState(0)
  const [decisionCount, setDecisionCount] = useState(0)
  const [history, setHistory] = useState([])
  const [city, setCity] = useState(() => getSavedCity())

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
      setSessionCo2((prev) => prev + parseCo2(data.co2_estimate))
      setDecisionCount((prev) => prev + 1)
      setHistory((prev) => [
        { decision, impact_level: data.impact_level, co2_estimate: data.co2_estimate },
        ...prev,
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50">
      {!city && <CityModal onSelect={handleCitySelect} />}

      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-green-800 tracking-tight">🌿 NudgeGreen</h1>
          <p className="mt-2 text-gray-500">Find out the environmental impact of your daily decisions</p>
          {city && (
            <button
              onClick={() => setCity(null)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white px-3 py-1 text-xs text-green-700 hover:border-green-400 transition-colors"
            >
              📍 {city.name}
              <span className="text-gray-400">· change</span>
            </button>
          )}
        </div>

        {/* Carbon story — appears after 2nd decision */}
        <CarbonStoryPanel totalCo2={sessionCo2} decisionCount={decisionCount} />

        {/* Input */}
        <div className="mb-8">
          <InputForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* States */}
        {loading && <LoadingState />}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {result && !loading && <ResultCard result={result} />}

        <HistoryFeed entries={history} />
      </div>
    </div>
  )
}
