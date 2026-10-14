import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookX, Check, ChevronRight, Copy, Heart, Minus, Plus, Share2, ShoppingBag, Truck, Zap, ShieldCheck, RotateCcw } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useToast } from '../context/ToastContext'
import useDocumentTitle from '../hooks/useDocumentTitle'
import Gallery from '../components/Gallery'
import Rating, { StarInput } from '../components/Rating'
import Price from '../components/Price'
import StockBadge from '../components/StockBadge'
import BookCard from '../components/BookCard'
import AuthorAvatar from '../components/AuthorAvatar'
import EmptyState from '../components/EmptyState'
import { copyText } from '../utils/clipboard'
import { deliveryWindow, formatDate, plural } from '../utils/format'
import { validateReview } from '../utils/validation'

function ReviewForm({ book }) {
  const { addReview, settings } = useStore()
  const [v, setV] = useState({ name: '', rating: 0, title: '', text: '' })
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const errs = validateReview(v)
    setErrors(errs)
    if (Object.keys(errs).length) return
    if (addReview({ bookId: book.id, ...v })) setV({ name: v.name, rating: 0, title: '', text: '' })
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80 sm:p-6">
      <h3 className="font-display text-2xl font-semibold">Write a review</h3>
      <p className="mt-1 text-xs text-ink-500">Demo reviews are saved in this browser only.</p>
      <div className="mt-4 space-y-4">
        <div>
          <span className="label">Your rating</span>
          <StarInput value={v.rating} onChange={(n) => setV((s) => ({ ...s, rating: n }))} error={errors.rating} />
          {errors.rating && <p id="rating-err" className="field-error">{errors.rating}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rv-name" className="label">Name</label>
            <input id="rv-name" className={`input ${errors.name ? 'input-error' : ''}`} value={v.name} onChange={set('name')} placeholder={settings.customer?.name || 'Your name'} aria-invalid={!!errors.name} />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="rv-title" className="label">Headline (optional)</label>
            <input id="rv-title" className="input" value={v.title} onChange={set('title')} placeholder="Sum it up" />
          </div>
        </div>
        <div>
          <label htmlFor="rv-text" className="label">Your review</label>
          <textarea id="rv-text" rows={4} className={`input ${errors.text ? 'input-error' : ''}`} value={v.text} onChange={set('text')} placeholder="What did you think of this book?" aria-invalid={!!errors.text} />
          {errors.text && <p className="field-error">{errors.text}</p>}
        </div>
        <button type="submit" className="btn btn-dark">Submit review</button>
      </div>
    </form>
  )
}

export default function BookDetails() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { books, categories, reviews, bookBySlug, addToCart, cart, isWishlisted, toggleWishlist } = useStore()
  const [qty, setQty] = useState(1)
  const [showAll, setShowAll] = useState(false)

  const book = bookBySlug(slug)
  useDocumentTitle(book ? book.title : 'Book not found')

  const bookReviews = useMemo(() => (book ? reviews.filter((r) => r.bookId === book.id).sort((a, b) => b.date.localeCompare(a.date)) : []), [reviews, book])
  const related = useMemo(() => {
    if (!book) return []
    const picked = book.related.map((s) => books.find((b) => b.slug === s)).filter(Boolean)
    const similar = books.filter((b) => b.category === book.category && b.id !== book.id && !picked.includes(b))
    return [...picked, ...similar].slice(0, 4)
  }, [book, books])
  const sameAuthor = useMemo(() => (book ? books.filter((b) => b.author === book.author && b.id !== book.id) : []), [book, books])

  if (!book) {
    return (
      <div className="container-x py-20">
        <EmptyState icon={BookX} title="We could not find that book" text="It may have been removed from the catalogue, or the link is mistyped." actionLabel="Browse all books" to="/shop" />
      </div>
    )
  }

  const cat = categories.find((c) => c.id === book.category)
  const out = book.stock < 1
  const inCart = cart.items.find((i) => i.bookId === book.id)?.qty || 0
  const maxQty = Math.max(1, book.stock)
  const q = Math.min(qty, maxQty)

  const changeQty = (n) => {
    if (n < 1) return
    if (n > book.stock) { toast.warning(`Only ${book.stock} ${plural(book.stock, 'copy', 'copies')} in stock.`); return }
    setQty(n)
  }

  const buyNow = () => { if (addToCart(book.id, q)) navigate('/checkout') }

  const link = typeof window !== 'undefined' ? window.location.href : ''
  const copyLink = async () => {
    if (await copyText(link)) toast.success('Link copied to your clipboard.')
    else toast.error('Could not copy the link. Copy it from the address bar instead.')
  }
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: book.title, text: `${book.title} by ${book.author}`, url: link }); return } catch (e) { if (e?.name === 'AbortError') return }
    }
    await copyLink()
  }

  const specs = [
    ['Author', book.author], ['Publisher', book.publisher || '-'],
    ['Publication date', book.publicationDate ? formatDate(book.publicationDate) : '-'],
    ['ISBN', book.isbn || '-'], ['Language', book.language], ['Pages', book.pages || '-'], ['Format', book.format],
  ]
  const shownReviews = showAll ? bookReviews : bookReviews.slice(0, 3)

  return (
    <div className="container-x py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
        <Link to="/" className="hover:text-ink">Home</Link><ChevronRight className="h-3.5 w-3.5" />
        <Link to="/shop" className="hover:text-ink">Shop</Link><ChevronRight className="h-3.5 w-3.5" />
        {cat && <><Link to={`/shop?category=${cat.id}`} className="hover:text-ink">{cat.name}</Link><ChevronRight className="h-3.5 w-3.5" /></>}
        <span className="text-ink">{book.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <Gallery book={book} />

        <div>
          {cat && <Link to={`/shop?category=${cat.id}`} className="text-sm font-semibold text-gold-700 hover:underline">{cat.name}</Link>}
          <h1 className="mt-1 font-display text-5xl font-semibold leading-[1.02] sm:text-6xl">{book.title}</h1>
          {book.subtitle && <p className="mt-2 font-display text-2xl italic text-ink-500">{book.subtitle}</p>}
          <p className="mt-3 text-[15px]">by <Link to={`/shop?author=${encodeURIComponent(book.author)}`} className="font-semibold underline decoration-gold underline-offset-4">{book.author}</Link></p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Rating value={book.rating} count={book.reviewCount} size="md" showDemo />
            <StockBadge stock={book.stock} />
          </div>

          <div className="mt-6"><Price book={book} size="lg" /></div>
          <p className="mt-1 text-xs text-ink-500">Illustrative demo price, not a live commercial offer.</p>
          <p className="mt-5 text-[16px] leading-relaxed text-ink-700">{book.summary}</p>

          {/* Purchase box */}
          <div className="mt-6 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span id="qty-label" className="label">Quantity</span>
                <div className="inline-flex items-center rounded-full border border-sand-300" role="group" aria-labelledby="qty-label">
                  <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sand-100 disabled:opacity-40" onClick={() => changeQty(q - 1)} disabled={out || q <= 1} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                  <output className="w-10 text-center font-semibold" aria-live="polite">{out ? 0 : q}</output>
                  <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sand-100 disabled:opacity-40" onClick={() => changeQty(q + 1)} disabled={out || q >= book.stock} aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="text-sm text-ink-500">Line total <b className="text-ink"><Total book={book} qty={out ? 0 : q} /></b>{inCart > 0 && <span> ({inCart} already in cart)</span>}</p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" className="btn btn-primary !py-3.5" disabled={out} onClick={() => addToCart(book.id, q)}><ShoppingBag className="h-4 w-4" /> {out ? 'Out of stock' : 'Add to Cart'}</button>
              <button type="button" className="btn btn-dark !py-3.5" disabled={out} onClick={buyNow}><Zap className="h-4 w-4" /> Buy Now</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => toggleWishlist(book.id)} aria-pressed={isWishlisted(book.id)}>
                <Heart className={`h-4 w-4 ${isWishlisted(book.id) ? 'fill-red-600 text-red-600' : ''}`} /> {isWishlisted(book.id) ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={share}><Share2 className="h-4 w-4" /> Share</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={copyLink}><Copy className="h-4 w-4" /> Copy Link</button>
            </div>
          </div>

          <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <li className="flex gap-2.5 rounded-2xl bg-sand-100 p-3.5"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" /><span><b className="block">Estimated delivery</b>{deliveryWindow()} <span className="text-ink-500">(illustrative)</span></span></li>
            <li className="flex gap-2.5 rounded-2xl bg-sand-100 p-3.5"><RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" /><span><b className="block">Easy returns</b>14 days, sample policy</span></li>
            <li className="flex gap-2.5 rounded-2xl bg-sand-100 p-3.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" /><span><b className="block">Checkout</b>Demo only, no payment taken</span></li>
          </ul>
        </div>
      </div>

      {/* Details */}
      <div className="mt-14 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="font-display text-4xl font-medium">About this book</h2>
          <p className="mt-4 max-w-prose text-[16px] leading-[1.75] text-ink-700">{book.description}</p>
          {book.highlights.length > 0 && (
            <>
              <h3 className="mt-8 font-display text-2xl font-semibold">Why you might love it</h3>
              <ul className="mt-3 space-y-2.5">
                {book.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-[15px] text-ink-700"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700"><Check className="h-3 w-3" /></span>{h}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div>
          <h2 className="font-display text-4xl font-medium">Details</h2>
          <dl className="mt-4 divide-y divide-sand-200 rounded-3xl bg-white px-5 shadow-soft ring-1 ring-sand-200/80">
            {specs.map(([k, val]) => (
              <div key={k} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium">{val}</dd></div>
            ))}
          </dl>
          <p className="hint">Specifications are sample data for the demo.</p>
        </div>
      </div>

      {/* Author */}
      <section className="mt-14 rounded-[2rem] bg-sand-100 p-6 sm:p-10" aria-labelledby="author-h">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <AuthorAvatar name={book.author} className="h-20 w-20 text-2xl" />
          <div className="min-w-0 flex-1">
            <h2 id="author-h" className="font-display text-3xl font-semibold">About {book.author}</h2>
            <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-ink-700">{book.authorBio || 'Author biography coming soon.'}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {sameAuthor.map((b) => <Link key={b.id} to={`/books/${b.slug}`} className="chip">{b.title}</Link>)}
              <Link to={`/shop?author=${encodeURIComponent(book.author)}`} className="link-underline text-sm font-semibold">{sameAuthor.length ? 'All books by this author' : 'See this author in the shop'}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-14" aria-labelledby="reviews-h">
        <h2 id="reviews-h" className="font-display text-4xl font-medium">Reader reviews</h2>
        <p className="mt-1 text-sm text-ink-500">Sample reviews for demonstration. Rating of {book.rating.toFixed(1)} from {book.reviewCount.toLocaleString('en-US')} demo ratings.</p>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            {bookReviews.length === 0 && <p className="rounded-2xl border border-dashed border-sand-300 p-6 text-sm text-ink-500">No written reviews yet. Be the first to share your thoughts.</p>}
            {shownReviews.map((r) => (
              <article key={r.id} className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3"><AuthorAvatar name={r.name} className="h-9 w-9 text-sm" /><div><p className="text-sm font-semibold">{r.name}</p><p className="text-xs text-ink-500">{formatDate(r.date)}{r.demo ? ' (demo review)' : ''}</p></div></div>
                  <Rating value={r.rating} showValue={false} />
                </div>
                {r.title && <h3 className="mt-3 font-sans text-[15px] font-bold">{r.title}</h3>}
                <p className="mt-1 text-[15px] leading-relaxed text-ink-700">{r.text}</p>
              </article>
            ))}
            {bookReviews.length > 3 && <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAll((s) => !s)}>{showAll ? 'Show fewer reviews' : `Show all ${bookReviews.length} reviews`}</button>}
          </div>
          <ReviewForm book={book} />
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related-h">
          <h2 id="related-h" className="font-display text-4xl font-medium">You might also like</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((b) => <BookCard key={b.id} book={b} />)}</div>
        </section>
      )}
    </div>
  )
}

function Total({ book, qty }) {
  const { money } = useStore()
  return <>{money(book.price * qty)}</>
}
