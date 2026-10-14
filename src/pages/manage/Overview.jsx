import { Link } from 'react-router-dom'
import { BookOpen, ShoppingCart, TrendingUp, TriangleAlert } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import StatusBadge from '../../components/StatusBadge'
import { LOW_STOCK } from '../../config'
import { formatDate, formatMoney } from '../../utils/format'

function Stat({ icon: Icon, label, value, note, tone = 'text-gold-700 bg-sand-100' }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80">
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-5 w-5" /></span>
      <p className="mt-4 text-sm text-ink-500">{label}</p>
      <p className="font-display text-4xl font-semibold leading-tight">{value}</p>
      {note && <p className="mt-1 text-xs text-ink-500">{note}</p>}
    </div>
  )
}

export default function Overview() {
  const { books, orders, money, updateBook } = useStore()
  const low = books.filter((b) => b.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock)
  const revenue = orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.totals.total, 0)
  const recent = orders.slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={BookOpen} label="Total books" value={books.length} note="In the catalogue" />
        <Stat icon={ShoppingCart} label="Demo orders" value={orders.length} note="Saved in this browser" />
        <Stat icon={TrendingUp} label="Demo revenue" value={money(revenue)} note="Excludes cancelled. Simulated." />
        <Stat icon={TriangleAlert} label="Low-stock items" value={low.length} note={`${LOW_STOCK} or fewer copies`} tone="text-amber-800 bg-amber-100" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80 sm:p-6" aria-labelledby="low-h">
          <div className="flex items-center justify-between"><h2 id="low-h" className="font-display text-3xl font-semibold">Needs restocking</h2><Link to="/manage/books" className="link-underline text-sm">All books</Link></div>
          {low.length === 0 ? <p className="mt-4 text-sm text-ink-500">Every book has healthy stock.</p> : (
            <ul className="mt-4 divide-y divide-sand-200">
              {low.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{b.title}</p><p className={`text-xs font-medium ${b.stock < 1 ? 'text-red-700' : 'text-amber-800'}`}>{b.stock < 1 ? 'Out of stock' : `${b.stock} left`}</p></div>
                  <button type="button" className="btn btn-outline btn-sm shrink-0" onClick={() => updateBook(b.id, { stock: b.stock + 10 }, `Added 10 copies of ${b.title}.`)}>Restock +10</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80 sm:p-6" aria-labelledby="recent-h">
          <div className="flex items-center justify-between"><h2 id="recent-h" className="font-display text-3xl font-semibold">Recent demo orders</h2><Link to="/manage/orders" className="link-underline text-sm">All orders</Link></div>
          {recent.length === 0 ? <p className="mt-4 text-sm text-ink-500">No orders yet. Place a demo order from the shop to see it here.</p> : (
            <ul className="mt-4 divide-y divide-sand-200">
              {recent.map((o) => (
                <li key={o.ref} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0"><p className="font-mono text-sm font-bold">{o.ref}</p><p className="truncate text-xs text-ink-500">{o.customer.name} &middot; {formatDate(o.createdAt)}</p></div>
                  <div className="flex items-center gap-3"><span className="text-sm font-semibold">{formatMoney(o.totals.total, o.currency)}</span><StatusBadge status={o.status} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
