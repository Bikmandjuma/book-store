import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import BookImage from './BookImage'
import Rating from './Rating'
import Price from './Price'
import StockBadge from './StockBadge'
import WishlistButton from './WishlistButton'

export default function BookCard({ book }) {
  const { addToCart, categories } = useStore()
  const cat = categories.find((c) => c.id === book.category)
  const out = book.stock < 1
  return (
    <article className="group flex h-full flex-col rounded-3xl bg-white p-3 shadow-soft ring-1 ring-sand-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-4">
      <div className="relative rounded-2xl bg-sand-100 px-6 pb-6 pt-7">
        <Link to={`/books/${book.slug}`} aria-label={`View details for ${book.title}`} className="block">
          <BookImage book={book} className="rounded-[3px] shadow-cover transition duration-300 group-hover:scale-[1.03]" />
        </Link>
        <div className="absolute right-3 top-3"><WishlistButton book={book} /></div>
        {book.originalPrice && book.originalPrice > book.price && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-ivory-50">
            -{Math.round((1 - book.price / book.originalPrice) * 100)}%
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col px-1">
        <p className="text-xs font-semibold text-gold-700">{cat?.name || 'Books'}</p>
        <h3 className="mt-1 line-clamp-2 font-display text-[22px] font-semibold leading-[1.1]">
          <Link to={`/books/${book.slug}`} className="hover:text-gold-700">{book.title}</Link>
        </h3>
        <p className="mt-1 text-sm text-ink-500">by {book.author}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">{book.summary || book.description}</p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <Rating value={book.rating} count={book.reviewCount} showDemo />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <Price book={book} />
          <StockBadge stock={book.stock} />
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Link to={`/books/${book.slug}`} className="btn btn-outline btn-sm">View Details</Link>
          <button type="button" className="btn btn-primary btn-sm" disabled={out} onClick={() => addToCart(book.id, 1)}>
            <ShoppingBag className="h-4 w-4" /> {out ? 'Sold out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
