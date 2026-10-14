import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2, X } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useConfirm } from '../context/ConfirmContext'
import useDocumentTitle from '../hooks/useDocumentTitle'
import BookImage from '../components/BookImage'
import EmptyState from '../components/EmptyState'
import Price from '../components/Price'
import StockBadge from '../components/StockBadge'
import Rating from '../components/Rating'

export default function Wishlist() {
  useDocumentTitle('Wishlist')
  const { books, wishlist, toggleWishlist, moveToCart, clearWishlist } = useStore()
  const confirm = useConfirm()
  const items = wishlist.map((id) => books.find((b) => b.id === id)).filter(Boolean)

  if (!items.length) {
    return (
      <div className="container-x py-16">
        <EmptyState icon={Heart} title="Your wishlist is empty" text="Tap the heart on any book to save it here for later." actionLabel="Find something to love" to="/shop" />
      </div>
    )
  }

  const onClear = async () => {
    if (await confirm({ title: 'Clear your wishlist?', message: 'All saved books will be removed from your wishlist. This cannot be undone.', confirmLabel: 'Clear wishlist', cancelLabel: 'Keep them', tone: 'danger' })) clearWishlist()
  }

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-5xl font-medium text-ink-700 sm:text-6xl">Wishlist</h1>
          <p className="mt-1 text-sm text-ink-500">{items.length} saved {items.length === 1 ? 'book' : 'books'}</p>
        </div>
        <button type="button" onClick={onClear} className="btn btn-ghost text-red-800 hover:!bg-red-50"><Trash2 className="h-4 w-4" /> Clear wishlist</button>
      </div>

      <ul className="mt-8 grid gap-5 md:grid-cols-2">
        {items.map((b) => (
          <li key={b.id} className="relative flex gap-4 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-sand-200/80 sm:gap-5 sm:p-5">
            <Link to={`/books/${b.slug}`} className="w-24 shrink-0 sm:w-28" aria-label={`View details for ${b.title}`}><BookImage book={b} className="rounded-[3px] shadow-cover" /></Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 className="line-clamp-2 pr-8 font-display text-2xl font-semibold leading-tight"><Link to={`/books/${b.slug}`} className="hover:text-gold-700">{b.title}</Link></h2>
              <p className="text-sm text-ink-500">by {b.author}</p>
              <div className="mt-2"><Rating value={b.rating} count={b.reviewCount} /></div>
              <div className="mt-2 flex flex-wrap items-center gap-2"><Price book={b} /><StockBadge stock={b.stock} /></div>
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <button type="button" disabled={b.stock < 1} onClick={() => moveToCart(b.id)} className="btn btn-primary btn-sm"><ShoppingBag className="h-4 w-4" /> {b.stock < 1 ? 'Sold out' : 'Move to Cart'}</button>
                <Link to={`/books/${b.slug}`} className="btn btn-outline btn-sm">View Details</Link>
              </div>
            </div>
            <button type="button" onClick={() => toggleWishlist(b.id)} aria-label={`Remove ${b.title} from wishlist`} className="absolute right-3 top-3 rounded-full p-2 text-ink-500 hover:bg-sand-100 hover:text-ink"><X className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
    </div>
  )
}
