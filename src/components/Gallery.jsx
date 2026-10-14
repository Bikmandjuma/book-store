import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import BookImage from './BookImage'
import Modal from './Modal'

const LABELS = ['Front cover', 'Back cover', 'Inside page']

export default function Gallery({ book }) {
  const images = book.gallery.length ? book.gallery : [book.cover || 'gen:cover', 'gen:back', 'gen:quote']
  const [idx, setIdx] = useState(0)
  const [zoom, setZoom] = useState(false)
  useEffect(() => setIdx(0), [book.id])

  const step = useCallback((d) => setIdx((x) => (x + d + images.length) % images.length), [images.length])

  useEffect(() => {
    if (!zoom) return undefined
    const onKey = (e) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [zoom, step])

  const label = (k) => LABELS[k] || `Image ${k + 1}`

  return (
    <div>
      <div className="relative rounded-[2rem] bg-sand-100 px-[14%] py-10 sm:px-[18%] sm:py-12">
        <button type="button" onClick={() => setZoom(true)} className="group block w-full cursor-zoom-in" aria-label={`Enlarge image: ${label(idx)}`}>
          <BookImage key={images[idx]} book={book} src={images[idx]} alt={`${book.title}: ${label(idx)}`} eager className="rounded-[4px] shadow-cover" />
        </button>
        <button type="button" onClick={() => setZoom(true)} aria-label="Open enlarged viewer" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-soft ring-1 ring-sand-200 transition hover:scale-105">
          <Maximize2 className="h-4 w-4" />
        </button>
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-soft ring-1 ring-sand-200 transition hover:scale-105"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={() => step(1)} aria-label="Next image" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-soft ring-1 ring-sand-200 transition hover:scale-105"><ChevronRight className="h-5 w-5" /></button>
          </>
        )}
      </div>

      <div className="mt-4 flex justify-center gap-3" role="tablist" aria-label="Book images">
        {images.map((src, k) => (
          <button key={`${src}-${k}`} type="button" role="tab" aria-selected={k === idx} aria-label={`Show ${label(k)}`} onClick={() => setIdx(k)}
            className={`w-16 overflow-hidden rounded-xl bg-sand-100 p-1.5 ring-2 transition sm:w-20 ${k === idx ? 'ring-gold-600' : 'ring-transparent hover:ring-sand-300'}`}>
            <BookImage book={book} src={src} alt={`${label(k)} thumbnail`} className="rounded-[2px]" />
          </button>
        ))}
      </div>

      <Modal open={zoom} onClose={() => setZoom(false)} title={`${book.title}: ${label(idx)}`} size="lg">
        <div className="relative mx-auto max-w-md rounded-2xl bg-sand-100 p-6 sm:p-8">
          <BookImage key={`z-${images[idx]}`} book={book} src={images[idx]} alt={`${book.title}: ${label(idx)} (enlarged)`} eager className="rounded-[4px] shadow-cover" />
        </div>
        <div className="mt-5 flex items-center justify-center gap-3">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => step(-1)}><ChevronLeft className="h-4 w-4" /> Previous</button>
          <span className="text-sm text-ink-500">{idx + 1} of {images.length}</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => step(1)}>Next <ChevronRight className="h-4 w-4" /></button>
        </div>
      </Modal>
    </div>
  )
}
