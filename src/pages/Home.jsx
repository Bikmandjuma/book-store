import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Copy, Gift, Quote, Sparkles, Truck, ShieldCheck, RotateCcw } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useToast } from '../context/ToastContext'
import useDocumentTitle from '../hooks/useDocumentTitle'
import HeroCarousel from '../components/HeroCarousel'
import BookCard from '../components/BookCard'
import BookCardCompact from '../components/BookCardCompact'
import BookImage from '../components/BookImage'
import Section from '../components/Section'
import Newsletter from '../components/Newsletter'
import AuthorAvatar from '../components/AuthorAvatar'
import { iconFor } from '../utils/icons'
import { groupAuthors } from '../utils/authors'
import { copyText } from '../utils/clipboard'
import { discountPercent, plural } from '../utils/format'

const TESTIMONIALS = [
  { name: 'Amina K.', role: 'Teacher, Kigali', text: 'Finding a book took seconds, and the wishlist kept my reading list tidy. It feels like a proper bookshop.' },
  { name: 'Jean Paul N.', role: 'Software developer', text: 'Clear prices, honest descriptions and a quick checkout. I could picture my own shelf here.' },
  { name: 'Grace M.', role: 'Book club host', text: 'The editor picks gave our club three great reads in a row. I will be back every month.' },
]

export default function Home() {
  useDocumentTitle()
  const { books, categories, wishlist, cartLines, settings, money } = useStore()
  const toast = useToast()
  const [tab, setTab] = useState('new')

  const hero = useMemo(() => {
    const f = books.filter((b) => b.featured).sort((a, b) => b.popularity - a.popularity)
    return (f.length >= 3 ? f : [...books].sort((a, b) => b.popularity - a.popularity)).slice(0, 6)
  }, [books])

  const authors = useMemo(() => groupAuthors(books), [books])
  const strip = useMemo(() => {
    const preferred = ['James Clear', 'Napoleon Hill', 'Robert Kiyosaki', 'Brian Tracy']
    const picked = preferred.map((n) => authors.find((a) => a.name === n)).filter(Boolean)
    for (const a of authors) { if (picked.length >= 4) break; if (!picked.includes(a)) picked.push(a) }
    return picked.slice(0, 4)
  }, [authors])

  const recommended = useMemo(() => {
    const inCart = new Set(cartLines.map((l) => l.book.id))
    const liked = new Set([
      ...wishlist.map((id) => books.find((b) => b.id === id)?.category),
      ...cartLines.map((l) => l.book.category),
    ].filter(Boolean))
    return books
      .filter((b) => b.stock > 0 && !inCart.has(b.id) && !wishlist.includes(b.id))
      .sort((a, b) => (liked.has(b.category) ? 1 : 0) - (liked.has(a.category) ? 1 : 0) || b.rating * b.popularity - a.rating * a.popularity)
      .slice(0, 4)
  }, [books, wishlist, cartLines])

  const bestsellers = useMemo(() => books.filter((b) => b.bestseller).sort((a, b) => b.popularity - a.popularity).slice(0, 4), [books])
  const newArrivals = useMemo(() => [...books].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 4), [books])
  const onOffer = useMemo(() => books.filter((b) => b.originalPrice).sort((a, b) => discountPercent(b.price, b.originalPrice) - discountPercent(a.price, a.originalPrice)).slice(0, 4), [books])
  const picks = useMemo(() => books.filter((b) => b.editorPick).slice(0, 3), [books])
  const shelf = tab === 'new' ? newArrivals : onOffer

  const copyCode = async (code) => {
    const ok = await copyText(code)
    if (ok) toast.success(`Code ${code} copied. Paste it in your cart.`)
    else toast.error('Could not copy the code. Type it in manually: ' + code)
  }

  return (
    <>
      {/* HERO */}
      <section className="overflow-hidden pb-6 pt-8 sm:pt-12 lg:pt-16">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6">
          <div>
            <h1 className="font-display text-[56px] font-medium leading-[0.95] tracking-tight text-ink-700 sm:text-7xl lg:text-[88px]">
              Find your<br />next book
            </h1>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-500">
              Discover a world where every page brings a new adventure. We curate a diverse collection of books and deliver them to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn btn-primary !px-7 !py-3.5">Explore Books <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/shop?sort=popular" className="btn btn-outline !px-7 !py-3.5">Discover Bestsellers</Link>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-500">
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-gold-700" /> Free delivery over {money(settings.freeDeliveryThreshold)}</li>
              <li className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-gold-700" /> 14-day returns</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold-700" /> Hand-picked titles</li>
            </ul>
          </div>
          <HeroCarousel books={hero} />
        </div>
      </section>

      {/* AUTHOR STRIP */}
      <section aria-label="Popular authors" className="py-4">
        <div className="container-x">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {strip.map((a) => (
              <li key={a.name}>
                <Link to={`/shop?author=${encodeURIComponent(a.name)}`} className="group flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-sand-100">
                  <AuthorAvatar name={a.name} />
                  <span className="min-w-0 flex-1 truncate text-[15px] text-ink-500 group-hover:text-ink">Latest from {a.name}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-400 transition group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* RECOMMENDED */}
      <Section title="Recommended for you" to="/shop?sort=rating">
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map((b) => <BookCardCompact key={b.id} book={b} />)}
        </div>
      </Section>

      {/* CATEGORIES */}
      <Section title="Browse by category" subtitle="Pick a shelf and wander." to="/shop">
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {categories.map((c) => {
            const Icon = iconFor(c.icon)
            const count = books.filter((b) => b.category === c.id).length
            return (
              <li key={c.id}>
                <Link to={`/shop?category=${c.id}`} className="group flex h-full flex-col rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80 transition duration-300 hover:-translate-y-1 hover:bg-sand-100 hover:shadow-lift">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sand-100 text-gold-700 transition group-hover:bg-white"><Icon className="h-5 w-5" /></span>
                  <span className="mt-4 font-display text-2xl font-semibold leading-tight">{c.name}</span>
                  <span className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink-500">{c.description}</span>
                  <span className="mt-auto pt-4 text-xs font-semibold text-gold-700">{count} {plural(count, 'book')}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </Section>

      {/* BESTSELLERS */}
      <Section title="Bestselling books" subtitle="What readers are picking up this month (demo popularity)." to="/shop?sort=popular">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </Section>

      {/* PROMO BANNERS */}
      <section aria-label="Offers and collections" className="py-6">
        <div className="container-x grid gap-4 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[2rem] bg-gold-600 p-8 text-white sm:p-10">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" aria-hidden="true" />
            <Gift className="h-7 w-7" />
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight">The reading season sale</h2>
            <p className="mt-2 max-w-sm text-[15px] text-white/90">Take 10% off your order with the sample code below. Applies in your cart, valid for this demo only.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => copyCode('WELCOME10')} className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-white/80 px-5 py-2.5 font-mono text-sm font-bold tracking-wider transition hover:bg-white/15">
                WELCOME10 <Copy className="h-4 w-4" />
              </button>
              <Link to="/shop?sale=1" className="btn bg-white text-gold-700 hover:bg-ivory-100">Shop offers</Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-ivory-50 sm:p-10">
            <div className="absolute -bottom-12 -right-8 h-52 w-52 rounded-full bg-gold/25" aria-hidden="true" />
            <Sparkles className="h-7 w-7 text-gold" />
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight">The money and mindset shelf</h2>
            <p className="mt-2 max-w-sm text-[15px] text-ivory-50/75">A hand-picked collection on wealth, habits and clear thinking. Start anywhere, finish smarter.</p>
            <div className="mt-6"><Link to="/shop?category=business" className="btn btn-primary">See the collection <ArrowRight className="h-4 w-4" /></Link></div>
          </div>
        </div>
      </section>

      {/* NEW / OFFERS SHELF */}
      <Section title={tab === 'new' ? 'New arrivals' : 'Books on offer'} to={tab === 'new' ? '/shop?sort=newest' : '/shop?sale=1'}>
        <div role="tablist" aria-label="Choose shelf" className="mb-6 inline-flex rounded-full bg-sand-100 p-1">
          {[{ id: 'new', label: 'New arrivals' }, { id: 'sale', label: 'On offer' }].map((t) => (
            <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${tab === t.id ? 'bg-white text-ink shadow-soft' : 'text-ink-500 hover:text-ink'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shelf.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </Section>

      {/* EDITOR'S PICKS */}
      {picks.length > 0 && (
        <Section title="Editor's picks" subtitle="Three books our team keeps pressing into people's hands.">
          <div className="grid gap-5 lg:grid-cols-3">
            {picks.map((b) => (
              <article key={b.id} className="flex gap-5 rounded-3xl bg-sand-100 p-5 sm:p-6">
                <Link to={`/books/${b.slug}`} className="w-[34%] shrink-0 self-start" aria-label={`View details for ${b.title}`}>
                  <BookImage book={b} className="rounded-[3px] shadow-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Quote className="h-5 w-5 text-gold-700" aria-hidden="true" />
                  <p className="mt-2 font-display text-xl font-medium leading-snug">{b.editorNote || b.summary}</p>
                  <p className="mt-3 text-sm font-semibold">{b.title}</p>
                  <p className="text-[13px] text-ink-500">{b.author}</p>
                  <Link to={`/books/${b.slug}`} className="link-underline mt-auto pt-4 text-sm font-semibold">Read more</Link>
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}

      {/* AUTHORS */}
      <Section title="Popular authors" to="/shop">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {authors.slice(0, 6).map((a) => (
            <li key={a.name}>
              <Link to={`/shop?author=${encodeURIComponent(a.name)}`} className="flex h-full flex-col items-center rounded-3xl bg-white px-3 py-6 text-center shadow-soft ring-1 ring-sand-200/80 transition hover:-translate-y-1 hover:shadow-lift">
                <AuthorAvatar name={a.name} className="h-16 w-16 text-xl" />
                <span className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">{a.name}</span>
                <span className="mt-1 text-xs text-ink-500">{a.books.length} {plural(a.books.length, 'title')}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* TESTIMONIALS */}
      <Section title="What readers say" subtitle="Sample testimonials for demonstration. Not real customers.">
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand-200/80">
              <Quote className="h-6 w-6 text-gold" aria-hidden="true" />
              <blockquote className="mt-3 text-[15px] leading-relaxed text-ink-700">{t.text}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <AuthorAvatar name={t.name} className="h-10 w-10 text-sm" />
                <span><span className="block text-sm font-semibold">{t.name}</span><span className="block text-xs text-ink-500">{t.role} (sample)</span></span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Newsletter />
    </>
  )
}
