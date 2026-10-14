import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import BookImage from './BookImage'
import Price from './Price'
import useReducedMotion from '../hooks/useReducedMotion'

/** Arch-shaped book carousel. The centre arch is the active book; neighbours peek in on each side. */
export default function HeroCarousel({ books }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = useReducedMotion()
  const n = books.length

  useEffect(() => {
    if (paused || reduced || n < 2) return undefined
    const t = setInterval(() => setI((x) => (x + 1) % n), 5200)
    return () => clearInterval(t)
  }, [paused, reduced, n])

  if (!n) return null
  const half = Math.floor(n / 2)
  const current = books[i % n]
  const go = (d) => setI((x) => (x + d + n) % n)

  return (
    <div
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      role="region" aria-roledescription="carousel" aria-label="Featured books"
    >
      <div className="relative h-[330px] overflow-hidden sm:h-[390px] lg:h-[420px]">
        {books.map((book, k) => {
          const off = ((k - i + n + half) % n) - half
          const hidden = Math.abs(off) > 1
          const active = off === 0
          const style = {
            transform: `translateX(calc(-50% + ${off * 106}%)) scale(${active ? 1 : 0.9})`,
            opacity: hidden ? 0 : 1,
            zIndex: active ? 2 : 1,
            transition: reduced ? 'none' : 'transform .65s cubic-bezier(.2,.7,.2,1), opacity .5s ease',
            pointerEvents: hidden ? 'none' : 'auto',
          }
          const arch = (
            <span className={`relative block h-full w-full rounded-t-[999px] ${active ? 'bg-sand-200' : 'bg-sand-100'}`}>
              <span className="absolute left-1/2 top-[13%] block w-[56%] -translate-x-1/2">
                <BookImage book={book} eager className="rounded-[3px] shadow-cover" />
              </span>
            </span>
          )
          const cls = 'absolute bottom-0 left-1/2 block h-full w-[58%] origin-bottom sm:w-[33%]'
          return active ? (
            <Link key={book.id} to={`/books/${book.slug}`} style={style} className={cls} aria-label={`${book.title} by ${book.author}. View details`}>{arch}</Link>
          ) : (
            <button key={book.id} type="button" style={style} className={cls} onClick={() => setI(k)} tabIndex={hidden ? -1 : 0} aria-hidden={hidden} aria-label={`Show ${book.title}`}>{arch}</button>
          )
        })}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2" role="tablist" aria-label="Choose featured book">
          {books.map((b, k) => (
            <button key={b.id} type="button" role="tab" aria-selected={k === i} aria-label={`Show ${b.title}`} onClick={() => setI(k)}
              className={`h-2 rounded-full transition-all ${k === i ? 'w-6 bg-gold-600' : 'w-2 bg-sand-300 hover:bg-ink-400'}`} />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => go(-1)} aria-label="Previous book" className="rounded-full p-2 text-ink-500 hover:bg-sand-100 hover:text-ink"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" onClick={() => go(1)} aria-label="Next book" className="rounded-full p-2 text-ink-500 hover:bg-sand-100 hover:text-ink"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-soft ring-1 ring-sand-200/80" aria-live="polite">
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-semibold">{current.title}</p>
          <p className="truncate text-sm text-ink-500">{current.author}</p>
        </div>
        <div className="flex items-center gap-4">
          <Price book={current} showBadge={false} />
          <Link to={`/books/${current.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-gold-700 hover:underline">View <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  )
}
