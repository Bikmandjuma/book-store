import { Star } from 'lucide-react'
import { useState } from 'react'

export default function Rating({ value = 0, count, size = 'sm', showValue = true, showDemo = false }) {
  const px = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'
  const v = Math.max(0, Math.min(5, Number(value) || 0))
  if (!count && !v) return <span className="text-xs text-ink-500">No ratings yet</span>
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-xs text-ink-500" aria-label={`Rated ${v.toFixed(1)} out of 5`}>
      <span className="inline-flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, v - (i - 1)))
          return (
            <span key={i} className={`relative inline-block ${px}`}>
              <Star className={`absolute inset-0 ${px} text-sand-300`} fill="currentColor" strokeWidth={0} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={`${px} text-gold`} fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          )
        })}
      </span>
      {showValue && <span className="font-semibold text-ink-700">{v.toFixed(1)}</span>}
      {count !== undefined && (
        <span>({Number(count).toLocaleString('en-US')}{showDemo ? ' demo ratings' : ''})</span>
      )}
    </span>
  )
}

export function StarInput({ value, onChange, error, id = 'rating' }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div role="radiogroup" aria-label="Your rating" aria-describedby={error ? `${id}-err` : undefined} className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="rounded p-0.5 transition hover:scale-110"
        >
          <Star className={`h-7 w-7 ${n <= shown ? 'text-gold' : 'text-sand-300'}`} fill="currentColor" strokeWidth={0} />
        </button>
      ))}
      {value > 0 && <span className="ml-2 text-sm text-ink-500">{value} of 5</span>}
    </div>
  )
}
