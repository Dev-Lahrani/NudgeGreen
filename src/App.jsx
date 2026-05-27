import { useState } from 'react'
import InputForm from './components/InputForm'
import LoadingState from './components/LoadingState'
import ResultCard from './components/ResultCard'
import SessionTracker from './components/SessionTracker'
import HistoryFeed from './components/HistoryFeed'
import { queryOllama } from './utils/ollama'

function parseCo2(estimate) {
  const match = String(estimate).match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}

export default function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [sessionCo2, setSessionCo2] = useState(0)
  const [choiceCount, setChoiceCount] = useState(0)
  const [hasSession, setHasSession] = useState(false)
  const [history, setHistory] = useState([])
  const [lastDecision, setLastDecision] = useState('')

  async function handleSubmit(decision) {
    setLoading(true)
    setResult(null)
    setError(null)
    setLastDecision(decision)
    try {
      const data = await queryOllama(decision)
      setResult(data)
      setSessionCo2((prev) => prev + parseCo2(data.co2_estimate))
      setChoiceCount((prev) => prev + (data.alternatives?.length ?? 0))
      setHasSession(true)
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
      {hasSession && <SessionTracker totalCo2={sessionCo2} choiceCount={choiceCount} />}

      <div className={`mx-auto max-w-2xl px-4 py-12 ${hasSession ? 'pt-20' : ''}`}>
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-green-800 tracking-tight">🌿 NudgeGreen</h1>
          <p className="mt-2 text-gray-500">Find out the environmental impact of your daily decisions</p>
        </div>

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
