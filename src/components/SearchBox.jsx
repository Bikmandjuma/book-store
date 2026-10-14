import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { suggestBooks } from '../utils/search'
import BookImage from './BookImage'

export default function SearchBox({ onDone, autoFocus = false, className = '', compact = false }) {
  const { books, categories, money } = useStore()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const wrap = useRef(null)
  const listId = useId()
  const suggestions = useMemo(() => suggestBooks(books, categories, q), [books, categories, q])

  useEffect(() => {
    const away = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [])

  const submit = (e) => {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop')
    setOpen(false)
    setQ('')
    onDone?.()
  }

  const go = (slug) => {
    navigate(`/books/${slug}`)
    setOpen(false)
    setQ('')
    onDone?.()
  }

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <form onSubmit={submit} role="search" className="relative">
        <label htmlFor={`${listId}-input`} className="sr-only">Search books, authors and categories</label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
        <input
          id={`${listId}-input`}
          type="search"
          value={q}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder={compact ? 'Search' : 'Search title, author or topic'}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
          aria-controls={listId}
          aria-expanded={open && suggestions.length > 0}
          className="w-full rounded-full border border-sand-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-ink-400 transition focus:border-gold-600 focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </form>

      {open && q.trim().length >= 2 && (
        <div id={listId} className="absolute left-0 right-0 top-full z-50 mt-2 min-w-[18rem] overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-sand-200">
          {suggestions.length ? (
            <ul>
              {suggestions.map((b) => (
                <li key={b.id}>
                  <button type="button" onClick={() => go(b.slug)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-sand-100">
                    <span className="w-9 shrink-0"><BookImage book={b} className="rounded-[2px]" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{b.title}</span>
                      <span className="block truncate text-xs text-ink-500">{b.author}</span>
                    </span>
                    <span className="text-sm font-semibold">{money(b.price)}</span>
                  </button>
                </li>
              ))}
              <li className="border-t border-sand-200">
                <button type="button" onClick={submit} className="w-full px-4 py-2.5 text-left text-sm font-medium text-gold-700 hover:bg-sand-100">
                  See all results for &ldquo;{q.trim()}&rdquo;
                </button>
              </li>
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-ink-500">No matches for &ldquo;{q.trim()}&rdquo;. Try a different title, author or topic.</p>
          )}
        </div>
      )}
    </div>
  )
}
