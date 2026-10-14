import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import BookImage from './BookImage'
import WishlistButton from './WishlistButton'

/** Cover-left, details-right card used in "Recommended for you". */
export default function BookCardCompact({ book }) {
  const { addToCart, money } = useStore()
  const out = book.stock < 1
  return (
    <article className="relative flex gap-4">
      <Link to={`/books/${book.slug}`} aria-label={`View details for ${book.title}`} className="w-[38%] max-w-[130px] shrink-0">
        <BookImage book={book} className="rounded-[3px] shadow-cover transition duration-300 hover:-translate-y-1" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <h3 className="line-clamp-2 font-sans text-[15px] font-semibold leading-snug">
          <Link to={`/books/${book.slug}`} className="hover:text-gold-700">{book.title}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] text-ink-500">By {book.author}</p>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1 text-ink-500"><Star className="h-3.5 w-3.5 fill-gold text-gold" /> {book.rating.toFixed(1)}</span>
          <span className="font-bold">{money(book.price)}</span>
        </div>
        <div className="mt-auto flex items-center gap-2 pt-3">
          <button type="button" disabled={out} onClick={() => addToCart(book.id, 1)} className="btn btn-outline btn-sm !rounded-md !px-3 !py-1.5">
            {out ? 'Sold out' : 'Add to cart'}
          </button>
          <WishlistButton book={book} variant="plain" className="!h-8 !w-8" />
        </div>
      </div>
    </article>
  )
}
