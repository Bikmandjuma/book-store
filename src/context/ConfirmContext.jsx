import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from '../components/Modal'

const ConfirmCtx = createContext(null)

/**
 * const confirm = useConfirm()
 * if (await confirm({ title, message, confirmLabel, tone: 'danger', requireText: 'RESET' })) { ... }
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)
  const [typed, setTyped] = useState('')
  const resolver = useRef(null)

  const confirm = useCallback((opts) => {
    setTyped('')
    setState(opts)
    return new Promise((resolve) => { resolver.current = resolve })
  }, [])

  const close = (result) => {
    resolver.current?.(result)
    resolver.current = null
    setState(null)
  }

  const danger = state?.tone === 'danger'
  const needsText = !!state?.requireText
  const canConfirm = !needsText || typed.trim() === state.requireText

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <Modal
        open={!!state}
        onClose={() => close(false)}
        title={state?.title || 'Are you sure?'}
        size="sm"
        z="z-[95]"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn btn-outline" onClick={() => close(false)} data-autofocus>
              {state?.cancelLabel || 'Keep it'}
            </button>
            <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} disabled={!canConfirm} onClick={() => close(true)}>
              {state?.confirmLabel || 'Confirm'}
            </button>
          </div>
        }
      >
        <div className="flex gap-4">
          {danger && (
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
              <AlertTriangle className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[15px] leading-relaxed text-ink-700">{state?.message}</p>
            {needsText && (
              <div className="mt-4">
                <label className="label" htmlFor="confirm-text">Type <b>{state.requireText}</b> to continue</label>
                <input id="confirm-text" className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
              </div>
            )}
          </div>
        </div>
      </Modal>
    </ConfirmCtx.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx)
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>')
  return ctx
}
