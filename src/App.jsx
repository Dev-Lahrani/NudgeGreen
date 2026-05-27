import { useState } from 'react'
import InputForm from './components/InputForm'
import LoadingState from './components/LoadingState'
import ResultCard from './components/ResultCard'
import { queryOllama } from './utils/ollama'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(decision) {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const data = await queryOllama(decision)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
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
      </div>
    </div>
  )
}
