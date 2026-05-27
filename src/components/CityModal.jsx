import { cities } from '../data/cities'

export default function CityModal({ onSelect }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 px-6 py-5 text-center">
          <div className="text-3xl mb-1">🌿</div>
          <h2 className="text-xl font-bold text-white">Welcome to NudgeGreen</h2>
          <p className="text-green-100 text-sm mt-1">
            Select your city for accurate CO₂ estimates
          </p>
        </div>

        {/* City grid */}
        <div className="p-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">
            Your city
          </p>
          <div className="grid grid-cols-2 gap-2">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => onSelect(city)}
                className="flex flex-col items-start rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-left hover:border-green-400 hover:bg-green-100 transition-colors group"
              >
                <span className="font-semibold text-gray-800 text-sm group-hover:text-green-800">
                  {city.name}
                </span>
                <span className="text-xs text-gray-400 mt-0.5 leading-tight">
                  {city.transit}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          This is used only to adjust transport CO₂ estimates
        </p>
      </div>
    </div>
  )
}
