import { useEffect, useRef, useState } from 'react'
import { hashString } from '../utils/id'

// Designed palettes used when a cover image is missing (and for the generated gallery panels).
const PALETTES = [
  { bg: '#23324A', fg: '#F6EBD3', accent: '#D9A55B' },
  { bg: '#7A3E2B', fg: '#FBEFD9', accent: '#F0C27B' },
  { bg: '#2F4A3C', fg: '#F3EEDC', accent: '#D8B46A' },
  { bg: '#4B2E4F', fg: '#F7EBDD', accent: '#E3B77A' },
  { bg: '#B27C3A', fg: '#1F1A14', accent: '#FFF4DC' },
  { bg: '#1F2730', fg: '#EFE6D2', accent: '#C99A4B' },
  { bg: '#8A3B3B', fg: '#FFF3E0', accent: '#F2C98A' },
  { bg: '#DCCFA9', fg: '#2A2218', accent: '#8A5A22' },
]

export const paletteFor = (title) => PALETTES[hashString(title) % PALETTES.length]

function Barcode({ seed, color }) {
  const digits = String(seed || '0000000000000').replace(/\D/g, '').padEnd(13, '0').slice(0, 13)
  const bars = []
  let x = 0
  for (let i = 0; i < digits.length * 2; i++) {
    const d = Number(digits[i % digits.length])
    const w = 1 + ((d + i) % 3)
    if (i % 2 === 0) bars.push(<rect key={i} x={x} y="0" width={w} height="34" fill={color} />)
    x += w + 1
  }
  return (
    <svg viewBox={`0 0 ${x} 34`} className="h-auto w-full" preserveAspectRatio="none" aria-hidden="true">{bars}</svg>
  )
}

/** A designed stand-in for a cover or gallery picture. Scales with its container width. */
export function GeneratedPanel({ book, kind = 'cover', className = '' }) {
  const p = paletteFor(book.title)
  const wrap = { containerType: 'inline-size' }
  const label = kind === 'back' ? `Back cover of ${book.title}` : kind === 'quote' ? `Reader highlight from ${book.title}` : `Cover of ${book.title} by ${book.author}`

  if (kind === 'back') {
    return (
      <div role="img" aria-label={label} className={`relative aspect-[2/3] w-full overflow-hidden ${className}`} style={{ ...wrap, background: p.bg, color: p.fg }}>
        <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: '9cqw' }}>
          <div>
            <p className="font-display font-semibold leading-tight" style={{ fontSize: '9cqw' }}>{book.title}</p>
            <div style={{ height: '0.7cqw', width: '14cqw', background: p.accent, margin: '4cqw 0' }} />
            <p className="leading-snug opacity-90" style={{ fontSize: '5.2cqw' }}>{book.summary || book.description.slice(0, 120)}</p>
          </div>
          <div>
            <p className="font-semibold opacity-80" style={{ fontSize: '4.2cqw', marginBottom: '2cqw' }}>{book.publisher}</p>
            <div className="rounded-sm bg-white" style={{ padding: '3cqw', width: '48cqw' }}>
              <Barcode seed={book.isbn || book.id} color="#111" />
              <p className="text-center font-mono text-[#111]" style={{ fontSize: '3.2cqw', marginTop: '1cqw' }}>{book.isbn || 'ISBN pending'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (kind === 'quote') {
    return (
      <div role="img" aria-label={label} className={`relative aspect-[2/3] w-full overflow-hidden bg-[#FBF6E8] ${className}`} style={{ ...wrap, color: '#2A2218' }}>
        <div className="absolute inset-0 flex flex-col justify-center" style={{ padding: '11cqw' }}>
          <span className="font-display leading-none" style={{ fontSize: '30cqw', color: p.bg, opacity: 0.9, marginBottom: '-6cqw' }}>&ldquo;</span>
          <p className="font-display font-medium leading-tight" style={{ fontSize: '8.6cqw' }}>
            {(book.highlights && book.highlights[0]) || book.summary}
          </p>
          <div style={{ height: '0.6cqw', width: '12cqw', background: p.bg, margin: '6cqw 0 3cqw' }} />
          <p style={{ fontSize: '4cqw' }} className="font-semibold opacity-70">From the inside page: {book.title}</p>
          <p style={{ fontSize: '3.4cqw' }} className="opacity-60">Sample highlight, demo content</p>
        </div>
      </div>
    )
  }

  // cover
  return (
    <div role="img" aria-label={label} className={`relative aspect-[2/3] w-full overflow-hidden ${className}`} style={{ ...wrap, background: p.bg, color: p.fg }}>
      <div className="absolute inset-[5cqw] border" style={{ borderColor: p.accent, opacity: 0.7 }} />
      <div className="absolute inset-0 flex flex-col items-center justify-between text-center" style={{ padding: '13cqw 11cqw' }}>
        <p className="font-semibold tracking-wide" style={{ fontSize: '4.4cqw', color: p.accent }}>{book.author}</p>
        <p className="font-display font-semibold leading-[1.02]" style={{ fontSize: book.title.length > 26 ? '10.5cqw' : '13.5cqw' }}>{book.title}</p>
        <div className="flex flex-col items-center" style={{ gap: '3cqw' }}>
          <span style={{ height: '0.7cqw', width: '14cqw', background: p.accent }} />
          <span style={{ fontSize: '3.8cqw' }} className="opacity-80">Booksta.store</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Renders a book picture. `src` may be a URL or a "gen:cover|back|quote" token.
 * A designed cover is always drawn underneath; the real image fades in on top once it has loaded.
 * If the URL fails, hangs, or is a tiny placeholder, the designed cover simply stays visible.
 */
export default function BookImage({ book, src, alt, className = '', eager = false }) {
  const [state, setState] = useState('loading') // loading | loaded | failed
  const imgRef = useRef(null)

  useEffect(() => {
    setState('loading')
    const img = imgRef.current
    if (img && img.complete) setState(img.naturalWidth >= 60 ? 'loaded' : 'failed')
  }, [src])

  const isGen = !src || src.startsWith('gen:')
  if (isGen) return <GeneratedPanel book={book} kind={src ? src.slice(4) || 'cover' : 'cover'} className={className} />

  return (
    <span className={`relative block aspect-[2/3] w-full overflow-hidden ${className}`}>
      <span aria-hidden={state !== 'failed'} className="absolute inset-0 block">
        <GeneratedPanel book={book} kind="cover" className="h-full !aspect-auto" />
      </span>
      {state !== 'failed' && (
        <img
          ref={imgRef}
          src={src}
          alt={alt ?? `Cover of ${book.title} by ${book.author}`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setState('failed')}
          onLoad={(e) => setState(e.currentTarget.naturalWidth < 60 ? 'failed' : 'loaded')}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </span>
  )
}
