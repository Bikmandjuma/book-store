import { useMemo, useState } from 'react'
import { BadgePercent, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { useConfirm } from '../../context/ConfirmContext'
import Modal from '../../components/Modal'
import BookImage from '../../components/BookImage'
import StockBadge from '../../components/StockBadge'
import { LOW_STOCK } from '../../config'
import { matchesQuery } from '../../utils/search'
import { discountPercent } from '../../utils/format'
import BookForm from './BookForm'

function DiscountModal({ book, onClose }) {
  const { applyDiscount, removeDiscount, money } = useStore()
  const [pct, setPct] = useState(book.originalPrice ? String(discountPercent(book.price, book.originalPrice)) : '10')
  const base = book.originalPrice || book.price
  const n = Number(pct)
  const preview = Number.isFinite(n) && n > 0 && n < 90 ? base * (1 - n / 100) : null
  return (
    <Modal open onClose={onClose} title="Discount" size="sm"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          {book.originalPrice && <button type="button" className="btn btn-outline" onClick={() => { if (removeDiscount(book.id)) onClose() }}>Remove discount</button>}
          <button type="button" className="btn btn-primary" onClick={() => { if (applyDiscount(book.id, pct)) onClose() }}>Apply discount</button>
        </div>
      }>
      <p className="text-sm text-ink-700"><b>{book.title}</b></p>
      <p className="mt-1 text-sm text-ink-500">Regular price {money(base)}</p>
      <label htmlFor="disc" className="label mt-4">Percent off</label>
      <input id="disc" data-autofocus type="number" min="1" max="89" className="input" value={pct} onChange={(e) => setPct(e.target.value)} />
      <p className="hint">{preview ? `Sale price: ${money(preview)}` : 'Enter a number from 1 to 89.'}</p>
    </Modal>
  )
}

export default function BooksAdmin() {
  const { books, categories, deleteBook, toggleFeatured, money } = useStore()
  const confirm = useConfirm()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [stock, setStock] = useState('')
  const [form, setForm] = useState(null) // null | 'new' | book
  const [discountFor, setDiscountFor] = useState(null)

  const catName = (id) => categories.find((c) => c.id === id)?.name || 'Uncategorised'
  const list = useMemo(() => books.filter((b) => {
    if (cat && b.category !== cat) return false
    if (stock === 'out' && b.stock > 0) return false
    if (stock === 'low' && !(b.stock > 0 && b.stock <= LOW_STOCK)) return false
    if (stock === 'in' && b.stock <= LOW_STOCK) return false
    return matchesQuery(b, catName(b.category), q)
  }), [books, categories, q, cat, stock]) // eslint-disable-line react-hooks/exhaustive-deps

  const onDelete = async (b) => {
    if (await confirm({ title: 'Delete this book?', message: `Are you sure you want to delete "${b.title}"? It will also be removed from carts and wishlists in this browser.`, confirmLabel: 'Delete book', cancelLabel: 'Keep book', tone: 'danger' })) deleteBook(b.id)
  }

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <label htmlFor="adm-q" className="sr-only">Search books</label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input id="adm-q" type="search" className="input !rounded-full !pl-10" placeholder="Search by title, author, ISBN" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <label className="sr-only" htmlFor="adm-cat">Filter by category</label>
        <select id="adm-cat" className="input lg:!w-52" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="sr-only" htmlFor="adm-stock">Filter by stock</label>
        <select id="adm-stock" className="input lg:!w-44" value={stock} onChange={(e) => setStock(e.target.value)}>
          <option value="">Any stock</option><option value="in">Healthy stock</option><option value="low">Low stock</option><option value="out">Out of stock</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={() => setForm('new')}><Plus className="h-4 w-4" /> Add book</button>
      </div>
      <p className="mt-3 text-sm text-ink-500" role="status">{list.length} of {books.length} books</p>

      {list.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-sand-300 p-10 text-center text-sm text-ink-500">No books match. Adjust the filters or add a new book.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-3xl bg-white shadow-soft ring-1 ring-sand-200/80">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-sand-200 bg-sand-100/60 text-xs text-ink-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Book</th>
                <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                <th scope="col" className="px-4 py-3 font-semibold">Price</th>
                <th scope="col" className="px-4 py-3 font-semibold">Stock</th>
                <th scope="col" className="px-4 py-3 font-semibold">Featured</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {list.map((b) => {
                const off = discountPercent(b.price, b.originalPrice)
                return (
                  <tr key={b.id} className="align-middle hover:bg-ivory-100/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 shrink-0"><BookImage book={b} src={b.cover} className="rounded-[2px]" /></span>
                        <span className="min-w-0"><span className="block max-w-[16rem] truncate font-semibold">{b.title}</span><span className="block truncate text-xs text-ink-500">{b.author}</span></span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{catName(b.category)}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{money(b.price)}</span>
                      {off > 0 && <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-gold-700">-{off}%</span>}
                    </td>
                    <td className="px-4 py-3"><StockBadge stock={b.stock} /> <span className="ml-1 text-xs text-ink-500">{b.stock}</span></td>
                    <td className="px-4 py-3">
                      <button type="button" role="switch" aria-checked={b.featured} onClick={() => toggleFeatured(b.id)} aria-label={`Featured: ${b.title}`}
                        className={`relative h-6 w-11 rounded-full transition ${b.featured ? 'bg-gold-600' : 'bg-sand-300'}`}>
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${b.featured ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" className="rounded-full p-2 hover:bg-sand-100" aria-label={`Set discount for ${b.title}`} title="Discount" onClick={() => setDiscountFor(b)}><BadgePercent className="h-[18px] w-[18px]" /></button>
                        <button type="button" className="rounded-full p-2 hover:bg-sand-100" aria-label={`Edit ${b.title}`} title="Edit" onClick={() => setForm(b)}><Pencil className="h-[18px] w-[18px]" /></button>
                        <button type="button" className="rounded-full p-2 text-red-700 hover:bg-red-50" aria-label={`Delete ${b.title}`} title="Delete" onClick={() => onDelete(b)}><Trash2 className="h-[18px] w-[18px]" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500"><Star className="h-3.5 w-3.5" /> Ratings and review counts are demo data. Prices are stored in USD and shown in the display currency chosen in Settings.</p>

      {form && <BookForm book={form === 'new' ? null : form} onClose={() => setForm(null)} />}
      {discountFor && <DiscountModal book={books.find((x) => x.id === discountFor.id) || discountFor} onClose={() => setDiscountFor(null)} />}
    </div>
  )
}
