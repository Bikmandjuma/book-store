import { useStore } from '../context/StoreContext'
import { discountPercent } from '../utils/format'

export default function Price({ book, size = 'md', showBadge = true }) {
  const { money } = useStore()
  const off = discountPercent(book.price, book.originalPrice)
  const big = size === 'lg'
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`font-bold text-ink ${big ? 'text-3xl' : 'text-base'}`}>{money(book.price)}</span>
      {off > 0 && (
        <>
          <span className={`text-ink-400 line-through ${big ? 'text-lg' : 'text-sm'}`}>{money(book.originalPrice)}</span>
          {showBadge && (
            <span className={`rounded-full bg-gold-100 font-semibold text-gold-700 ${big ? 'px-2.5 py-1 text-sm' : 'px-2 py-0.5 text-xs'}`}>
              Save {off}%
            </span>
          )}
        </>
      )}
    </span>
  )
}
