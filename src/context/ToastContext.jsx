import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastCtx = createContext(null)

const ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info }
const TONES = {
  success: 'border-emerald-700/25 [&_svg.tone]:text-emerald-700',
  error: 'border-red-700/30 [&_svg.tone]:text-red-700',
  warning: 'border-amber-600/35 [&_svg.tone]:text-amber-700',
  info: 'border-sky-700/25 [&_svg.tone]:text-sky-700',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
  }, [])

  const push = useCallback(
    (type, message, opts = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((t) => [...t.slice(-3), { id, type, message }])
      const ms = opts.duration ?? (type === 'error' ? 6500 : 3800)
      timers.current.set(id, setTimeout(() => dismiss(id), ms))
      return id
    },
    [dismiss],
  )

  const api = useMemo(
    () => ({
      success: (m, o) => push('success', m, o),
      error: (m, o) => push('error', m, o),
      warning: (m, o) => push('warning', m, o),
      info: (m, o) => push('info', m, o),
      dismiss,
    }),
    [push, dismiss],
  )

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 top-3 z-[100] flex flex-col gap-2 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:top-auto sm:w-[22rem]"
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.type]
          return (
            <div
              key={t.id}
              role={t.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex animate-toastIn items-start gap-3 rounded-2xl border bg-white px-4 py-3 text-sm shadow-lift ${TONES[t.type]}`}
            >
              <Icon className="tone mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="flex-1 leading-snug text-ink">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="-mr-1 rounded-full p-1 text-ink-500 transition hover:bg-sand-100 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
