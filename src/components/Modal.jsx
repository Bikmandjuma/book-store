import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Only the top-most modal reacts to Escape / Tab.
const stack = []

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl', xl: 'sm:max-w-5xl', full: 'sm:max-w-6xl' }
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export default function Modal({
  open, onClose, title, children, footer, size = 'md', variant = 'dialog', z = 'z-[80]', hideHeader = false, bodyClassName = '',
}) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const id = useId()
  const titleId = `${id}-title`

  useEffect(() => {
    if (!open) return undefined
    const previouslyFocused = document.activeElement
    stack.push(id)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = setTimeout(() => {
      const root = ref.current
      if (!root) return
      const el = root.querySelector('[data-autofocus]') || root.querySelector(FOCUSABLE)
      el?.focus()
    }, 30)

    const onKey = (e) => {
      if (stack[stack.length - 1] !== id) return
      if (e.key === 'Escape') {
        e.preventDefault()
        closeRef.current?.()
      }
      if (e.key === 'Tab' && ref.current) {
        const nodes = [...ref.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null)
        if (!nodes.length) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKey)
      const i = stack.indexOf(id)
      if (i >= 0) stack.splice(i, 1)
      if (!stack.length) document.body.style.overflow = prevOverflow
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus()
    }
  }, [open, id])

  if (!open) return null

  const isDrawer = variant === 'drawer'
  const isTop = variant === 'top'

  const wrapper = isDrawer
    ? 'items-stretch justify-end'
    : isTop
      ? 'items-start justify-center pt-4 sm:pt-20 px-3'
      : 'items-end justify-center sm:items-center sm:p-6'

  const panel = isDrawer
    ? 'h-full w-full max-w-sm animate-drawerIn rounded-l-3xl'
    : isTop
      ? `w-full ${SIZES[size]} animate-sheetUp rounded-3xl`
      : `w-full ${SIZES[size]} max-h-[92vh] animate-sheetUp rounded-t-3xl sm:rounded-3xl`

  return createPortal(
    <div className={`fixed inset-0 ${z} flex ${wrapper}`}>
      <div className="absolute inset-0 animate-fadeIn bg-charcoal/55 backdrop-blur-[2px]" onClick={() => closeRef.current?.()} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`relative flex flex-col overflow-hidden bg-ivory-50 shadow-lift ${panel}`}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between gap-4 border-b border-sand-200 px-5 py-4 sm:px-6">
            <h2 id={titleId} className="font-display text-2xl font-semibold leading-tight">{title}</h2>
            <button type="button" onClick={() => closeRef.current?.()} aria-label="Close" className="rounded-full p-2 text-ink-500 transition hover:bg-sand-100 hover:text-ink">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className={`min-h-0 flex-1 overflow-y-auto ${hideHeader ? '' : 'px-5 py-5 sm:px-6'} ${bodyClassName}`}>{children}</div>
        {footer && <div className="border-t border-sand-200 bg-white/70 px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
