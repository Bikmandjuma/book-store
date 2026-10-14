import { Heart } from 'lucide-react'
import { useStore } from '../context/StoreContext'

export default function WishlistButton({ book, variant = 'floating', className = '' }) {
  const { isWishlisted, toggleWishlist } = useStore()
  const on = isWishlisted(book.id)
  const base = variant === 'floating'
    ? 'flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-soft ring-1 ring-sand-200 hover:scale-105'
    : 'flex h-10 w-10 items-center justify-center rounded-full border border-ink/30 hover:border-ink hover:bg-white'
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${book.title} from wishlist` : `Add ${book.title} to wishlist`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(book.id) }}
      className={`${base} transition ${className}`}
    >
      <Heart className={`h-[18px] w-[18px] ${on ? 'fill-red-600 text-red-600' : 'text-ink-700'}`} />
    </button>
  )
}
