import { useEffect, useState, useRef } from 'react'

const DISMISSED_KEY = 'nudgegreen_install_dismissed'

function safeGetStorage(key) {
  try { return localStorage.getItem(key) } catch { return null }
}
function safeSetStorage(key, value) {
  try { localStorage.setItem(key, value) } catch { /* ignore */ }
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)
  const showTimerRef = useRef(null)
  const dismissTimerRef = useRef(null)

  useEffect(() => {
    if (safeGetStorage(DISMISSED_KEY)) return
    if (window.matchMedia('(display-mode: standalone)').matches) return

    function onBeforeInstall(e) {
      if (safeGetStorage(DISMISSED_KEY)) return
      e.preventDefault()
      setDeferredPrompt(e)
      showTimerRef.current = setTimeout(() => setVisible(true), 1200)
    }

    function onInstalled() {
      setVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      clearTimeout(showTimerRef.current)
      clearTimeout(dismissTimerRef.current)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt || installing) return
    setInstalling(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setVisible(false)
        setDeferredPrompt(null)
      } else {
        dismiss()
      }
    } catch {
      // prompt() already open or InvalidStateError
    } finally {
      setInstalling(false)
    }
  }

  function dismiss() {
    setVisible(false)
    safeSetStorage(DISMISSED_KEY, '1')
    dismissTimerRef.current = setTimeout(() => setDeferredPrompt(null), 300)
  }

  if (!deferredPrompt) return null

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-50 p-4 transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="mx-auto max-w-sm rounded-2xl bg-white border border-green-200 shadow-2xl px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
          <span className="text-xl leading-none">🌿</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 leading-tight">Install NudgeGreen</p>
          <p className="text-xs text-gray-500 mt-0.5">Add to home screen for quick access</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={dismiss}
            className="px-2.5 py-1.5 rounded-full text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Dismiss install prompt"
          >
            ✕
          </button>
          <button
            onClick={handleInstall}
            disabled={installing}
            className="px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-semibold hover:bg-green-700 active:bg-green-800 transition-colors disabled:opacity-50"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
