import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SearchX, SlidersHorizontal, X } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import useDocumentTitle from '../hooks/useDocumentTitle'
import BookCard from '../components/BookCard'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { matchesQuery } from '../utils/search'
import { PAGE_SIZE } from '../config'

const SORTS = [
  { id: 'popular', label: 'Most popular' },
  { id: 'newest', label: 'Newest first' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'title', label: 'Title A to Z' },
]

function FilterPanel({ params, setParam, setMany, categories, books, clearAll, currencyInfo, activeCount }) {
  const catCount = (id) => books.filter((b) => b.category === id).length
  const cat = params.get('category') || ''
  const rating = params.get('rating') || ''
  const maxPriceCap = Math.ceil(Math.max(...books.map((b) => b.price * currencyInfo.rate), 10))
  return (
    <div className="space-y-7">
      <div>
        <label htmlFor="f-q" className="label">Search</label>
        <input id="f-q" type="search" className="input" placeholder="Title, author, topic" value={params.get('q') || ''} onChange={(e) => setParam('q', e.target.value)} />
      </div>

      <fieldset>
        <legend className="label">Category</legend>
        <div className="space-y-1">
          {[{ id: '', name: 'All categories', n: books.length }, ...categories.map((c) => ({ id: c.id, name: c.name, n: catCount(c.id) }))].map((c) => (
            <label key={c.id || 'all'} className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition ${cat === c.id ? 'bg-sand-200 font-semibold' : 'hover:bg-sand-100'}`}>
              <span className="flex items-center gap-2.5">
                <input type="radio" name="category" className="h-4 w-4 accent-[#9A6A2F]" checked={cat === c.id} onChange={() => setParam('category', c.id)} />
                {c.name}
              </span>
              <span className="text-xs text-ink-500">{c.n}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Price range ({currencyInfo.code})</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="f-min" className="sr-only">Minimum price</label>
            <input id="f-min" type="number" inputMode="decimal" min="0" className="input" placeholder="Min" value={params.get('min') || ''} onChange={(e) => setParam('min', e.target.value)} />
          </div>
          <div>
            <label htmlFor="f-max" className="sr-only">Maximum price</label>
            <input id="f-max" type="number" inputMode="decimal" min="0" className="input" placeholder="Max" value={params.get('max') || ''} onChange={(e) => setParam('max', e.target.value)} />
          </div>
        </div>
        <label htmlFor="f-slider" className="sr-only">Maximum price slider</label>
        <input id="f-slider" type="range" min="0" max={maxPriceCap} step={maxPriceCap > 500 ? 50 : 1} value={Number(params.get('max')) || maxPriceCap}
          onChange={(e) => setParam('max', Number(e.target.value) >= maxPriceCap ? '' : e.target.value)} className="mt-3 w-full accent-[#9A6A2F]" />
        <p className="hint">Up to {Number(params.get('max')) || maxPriceCap} {currencyInfo.code}</p>
      </fieldset>

      <fieldset>
        <legend className="label">Rating</legend>
        <div className="flex flex-wrap gap-2">
          {[{ v: '', l: 'Any' }, { v: '4.5', l: '4.5+' }, { v: '4', l: '4.0+' }, { v: '3', l: '3.0+' }].map((r) => (
            <button key={r.v || 'any'} type="button" aria-pressed={rating === r.v} onClick={() => setParam('rating', r.v)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${rating === r.v ? 'border-ink bg-ink text-ivory-50' : 'border-sand-300 bg-white hover:border-ink'}`}>{r.l}</button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Availability</legend>
        <div className="space-y-2 text-sm">
          <label className="flex cursor-pointer items-center gap-2.5"><input type="checkbox" className="h-4 w-4 accent-[#9A6A2F]" checked={params.get('stock') === '1'} onChange={(e) => setParam('stock', e.target.checked ? '1' : '')} /> In stock only</label>
          <label className="flex cursor-pointer items-center gap-2.5"><input type="checkbox" className="h-4 w-4 accent-[#9A6A2F]" checked={params.get('sale') === '1'} onChange={(e) => setParam('sale', e.target.checked ? '1' : '')} /> On offer only</label>
        </div>
      </fieldset>

      {activeCount > 0 && <button type="button" onClick={clearAll} className="btn btn-outline w-full">Clear all filters</button>}
    </div>
  )
}

export default function Shop() {
  const { books, categories, currencyInfo } = useStore()
  const [params, setParams] = useSearchParams()
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [sheet, setSheet] = useState(false)

  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const author = params.get('author') || ''
  const sort = SORTS.some((s) => s.id === params.get('sort')) ? params.get('sort') : 'popular'
  const minRating = Number(params.get('rating')) || 0
  const inStock = params.get('stock') === '1'
  const sale = params.get('sale') === '1'
  const min = params.get('min') !== null && params.get('min') !== '' ? Number(params.get('min')) : null
  const max = params.get('max') !== null && params.get('max') !== '' ? Number(params.get('max')) : null
  const rangeInvalid = min !== null && max !== null && min > max

  const catTitle = categories.find((c) => c.id === category)
  useDocumentTitle(catTitle ? catTitle.name : q ? `Search: ${q}` : 'Shop all books')

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value === '' || value === null || value === undefined) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }
  const clearAll = () => setParams(sort !== 'popular' ? { sort } : {}, { replace: true })

  const results = useMemo(() => {
    const rate = currencyInfo.rate
    const catName = (id) => categories.find((c) => c.id === id)?.name || ''
    let list = books.filter((b) => {
      if (category && b.category !== category) return false
      if (author && b.author !== author) return false
      if (q && !matchesQuery(b, catName(b.category), q)) return false
      if (minRating && b.rating < minRating) return false
      if (inStock && b.stock < 1) return false
      if (sale && !(b.originalPrice && b.originalPrice > b.price)) return false
      const p = b.price * rate
      if (!rangeInvalid && min !== null && p < min) return false
      if (!rangeInvalid && max !== null && p > max) return false
      return true
    })
    const by = {
      popular: (a, b) => b.popularity - a.popularity,
      newest: (a, b) => b.addedAt.localeCompare(a.addedAt),
      rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      title: (a, b) => a.title.localeCompare(b.title),
    }[sort]
    return [...list].sort(by)
  }, [books, categories, category, author, q, minRating, inStock, sale, min, max, rangeInvalid, sort, currencyInfo.rate])

  // Reset pagination whenever the result set changes.
  const signature = params.toString()
  useEffect(() => { setVisible(PAGE_SIZE) }, [signature])

  const chips = []
  if (q) chips.push({ k: 'q', label: `"${q}"` })
  if (category) chips.push({ k: 'category', label: catTitle?.name || category })
  if (author) chips.push({ k: 'author', label: author })
  if (minRating) chips.push({ k: 'rating', label: `${minRating}+ stars` })
  if (inStock) chips.push({ k: 'stock', label: 'In stock' })
  if (sale) chips.push({ k: 'sale', label: 'On offer' })
  if (min !== null) chips.push({ k: 'min', label: `Min ${min} ${currencyInfo.code}` })
  if (max !== null) chips.push({ k: 'max', label: `Max ${max} ${currencyInfo.code}` })

  const panelProps = { params, setParam, categories, books, clearAll, currencyInfo, activeCount: chips.length }
  const shown = results.slice(0, visible)

  return (
    <div className="container-x py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-500">
        <Link to="/" className="hover:text-ink">Home</Link> <span aria-hidden="true">/</span> <span className="text-ink">Shop</span>
      </nav>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-5xl font-medium text-ink-700 sm:text-6xl">{catTitle ? catTitle.name : author ? author : 'All books'}</h1>
          <p className="mt-1 max-w-xl text-[15px] text-ink-500">{catTitle?.description || 'Browse the full shelf. Prices, ratings and stock are demo data.'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="btn btn-outline lg:hidden" onClick={() => setSheet(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Filters{chips.length ? ` (${chips.length})` : ''}
          </button>
          <div>
            <label htmlFor="sort" className="sr-only">Sort books</label>
            <select id="sort" className="input !w-auto !rounded-full !py-2.5 pr-9" value={sort} onChange={(e) => setParam('sort', e.target.value === 'popular' ? '' : e.target.value)}>
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_1fr] xl:grid-cols-[18rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand-200/80">
            <FilterPanel {...panelProps} />
          </div>
        </aside>

        <section aria-label="Results">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <p className="mr-2 text-sm text-ink-500" role="status">
              Showing <b className="text-ink">{Math.min(shown.length, results.length)}</b> of <b className="text-ink">{results.length}</b> {results.length === 1 ? 'book' : 'books'}
            </p>
            {chips.map((c) => (
              <button key={c.k} type="button" onClick={() => setParam(c.k, '')} className="chip" aria-label={`Remove filter ${c.label}`}>
                {c.label} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
          {rangeInvalid && <p role="alert" className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">Your minimum price is higher than your maximum, so the price filter is ignored. Adjust the range to apply it.</p>}

          {results.length === 0 ? (
            <EmptyState icon={SearchX} title="No books match these filters" text="Try a different spelling, widen the price range, or clear the filters to see the whole shelf." actionLabel="Clear all filters" onAction={() => setParams({}, { replace: true })} />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((b) => <BookCard key={b.id} book={b} />)}
              </div>
              {visible < results.length && (
                <div className="mt-10 text-center">
                  <button type="button" className="btn btn-outline !px-8 !py-3" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Load more books ({results.length - visible} left)
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <Modal open={sheet} onClose={() => setSheet(false)} title="Filters" size="md"
        footer={<button type="button" className="btn btn-primary w-full" onClick={() => setSheet(false)}>Show {results.length} {results.length === 1 ? 'book' : 'books'}</button>}>
        <FilterPanel {...panelProps} />
      </Modal>
    </div>
  )
}
