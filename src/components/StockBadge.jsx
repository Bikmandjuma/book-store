import { LOW_STOCK } from '../config'

export function stockState(stock) {
  if (stock < 1) return { key: 'out', label: 'Out of stock', cls: 'bg-red-50 text-red-800 ring-red-200', dot: 'bg-red-600' }
  if (stock <= LOW_STOCK) return { key: 'low', label: `Only ${stock} left`, cls: 'bg-amber-50 text-amber-900 ring-amber-200', dot: 'bg-amber-500' }
  return { key: 'in', label: 'In stock', cls: 'bg-emerald-50 text-emerald-800 ring-emerald-200', dot: 'bg-emerald-600' }
}

export default function StockBadge({ stock, className = '' }) {
  const s = stockState(stock)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.cls} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  )
}
