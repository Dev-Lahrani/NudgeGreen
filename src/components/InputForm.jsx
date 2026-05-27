export default function InputForm({ onSubmit, loading }) {
  function handleSubmit(e) {
    e.preventDefault()
    const value = e.target.elements.decision.value.trim()
    if (value) onSubmit(value)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        name="decision"
        rows={3}
        disabled={loading}
        placeholder="e.g. ordering Zomato delivery, driving to work, buying a plastic bottle..."
        className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-gray-800 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 disabled:opacity-50 resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="self-end rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {loading ? 'Analyzing...' : 'Check Impact'}
      </button>
    </form>
  )
}
