import { useEffect, useState } from 'react'
import { BADGE_CATALOG } from '../data/badges'

function Toast({ badgeId, onDone }) {
  const [visible, setVisible] = useState(false)
  const badge = BADGE_CATALOG.find((b) => b.id === badgeId)

  useEffect(() => {
    // mount → fade in
    const fadeIn = requestAnimationFrame(() => setVisible(true))
    // after 3.5s start fade out, then call onDone
    const hide = setTimeout(() => setVisible(false), 3500)
    const remove = setTimeout(onDone, 4000)
    return () => {
      cancelAnimationFrame(fadeIn)
      clearTimeout(hide)
      clearTimeout(remove)
    }
  }, [onDone])

  if (!badge) return null

  return (
    <div
      className="flex items-center gap-3 bg-white border border-green-200 rounded-2xl shadow-lg px-4 py-3 min-w-[220px] transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-8px)' }}
    >
      <span className="text-2xl shrink-0">{badge.icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Badge unlocked!</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{badge.name}</p>
      </div>
    </div>
  )
}

export default function BadgeToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <Toast key={t.id} badgeId={t.badgeId} onDone={() => onDismiss(t.id)} />
      ))}
    </div>
  )
}
