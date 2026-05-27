export default function SessionTracker({ totalCo2, choiceCount }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-green-100 shadow-sm">
      <div className="mx-auto max-w-2xl px-4 py-2 flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Session footprint:{' '}
          <span className="font-bold text-green-800">{totalCo2.toFixed(1)} kg CO₂</span>
        </span>
        <span className="text-gray-600">
          <span className="font-bold text-green-600">{choiceCount}</span> greener choices available
        </span>
      </div>
    </div>
  )
}
