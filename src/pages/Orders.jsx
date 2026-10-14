import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, PackageOpen } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useConfirm } from '../context/ConfirmContext'
import useDocumentTitle from '../hooks/useDocumentTitle'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import OrderDetails from '../components/OrderDetails'
import BookImage from '../components/BookImage'
import { CANCELLABLE, ORDER_STATUSES } from '../config'
import { formatDate, formatMoney, plural } from '../utils/format'

export default function Orders() {
  useDocumentTitle('My orders')
  const { orders, cancelOrder } = useStore()
  const confirm = useConfirm()
  const [openRef, setOpenRef] = useState(null)
  const [filter, setFilter] = useState('All')
  const selected = orders.find((o) => o.ref === openRef)
  const list = filter === 'All' ? orders : orders.filter((o) => o.status === filter)

  const onCancel = async (o) => {
    const ok = await confirm({
      title: 'Cancel this demo order?', tone: 'danger', confirmLabel: 'Cancel order', cancelLabel: 'Keep order',
      message: `Order ${o.ref} will be marked as cancelled and its books returned to stock. This is a simulation and nothing is refunded because nothing was charged.`,
    })
    if (ok) cancelOrder(o.ref)
  }

  if (!orders.length) {
    return (
      <div className="container-x py-16">
        <EmptyState icon={PackageOpen} title="No orders yet" text="When you place a demo order it will appear here with its simulated status." actionLabel="Start shopping" to="/shop" />
      </div>
    )
  }

  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="font-display text-5xl font-medium text-ink-700 sm:text-6xl">My orders</h1>
      <div className="mt-4 flex gap-3 rounded-2xl bg-sky-50 px-4 py-3.5 text-sm leading-relaxed text-sky-900">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <p>These are demonstration records stored in this browser. Statuses are simulated and orders are not sent to a real bookstore or delivery provider. Update statuses from the <Link to="/manage/orders" className="font-semibold underline">store management demo</Link>.</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {['All', ...ORDER_STATUSES].map((s) => (
          <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition ${filter === s ? 'border-ink bg-ink text-ivory-50' : 'border-sand-300 bg-white hover:border-ink'}`}>{s}</button>
        ))}
      </div>

      {list.length === 0 && <p className="mt-8 rounded-2xl border border-dashed border-sand-300 p-8 text-center text-sm text-ink-500">No orders with the status &ldquo;{filter}&rdquo;.</p>}

      <ul className="mt-6 space-y-4">
        {list.map((o) => {
          const items = o.items.reduce((n, i) => n + i.qty, 0)
          return (
            <li key={o.ref} className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-base font-bold">{o.ref}</p>
                  <p className="text-sm text-ink-500">{formatDate(o.createdAt)} &middot; {items} {plural(items, 'item')}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex -space-x-3">
                  {o.items.slice(0, 5).map((it) => (
                    <span key={it.bookId} className="w-10 overflow-hidden rounded-[3px] ring-2 ring-white" title={`${it.qty} x ${it.title}`}>
                      <BookImage book={{ title: it.title, author: it.author, isbn: it.isbn, id: it.bookId, summary: '', description: '', highlights: [] }} src={it.cover} />
                    </span>
                  ))}
                  {o.items.length > 5 && <span className="flex h-[60px] w-10 items-center justify-center rounded-[3px] bg-sand-200 text-xs font-bold ring-2 ring-white">+{o.items.length - 5}</span>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-500">Total (demo)</p>
                  <p className="text-xl font-bold">{formatMoney(o.totals.total, o.currency)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-500">Deliver to {o.customer.name}, {o.delivery.city}, {o.delivery.country}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="btn btn-dark btn-sm" onClick={() => setOpenRef(o.ref)}>View Details</button>
                {CANCELLABLE.includes(o.status) && <button type="button" className="btn btn-outline btn-sm !border-red-300 text-red-800 hover:!bg-red-50" onClick={() => onCancel(o)}>Cancel Order</button>}
              </div>
            </li>
          )
        })}
      </ul>

      <Modal open={!!selected} onClose={() => setOpenRef(null)} title="Order details" size="lg">
        {selected && <OrderDetails order={selected} />}
      </Modal>
    </div>
  )
}
