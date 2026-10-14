import { Check, Info } from 'lucide-react'
import { PROGRESS_STATUSES } from '../config'
import { formatDateTime, formatMoney } from '../utils/format'
import StatusBadge from './StatusBadge'
import BookImage from './BookImage'

export function OrderTimeline({ order }) {
  if (order.status === 'Cancelled') {
    return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-900">This demo order was cancelled and stock was returned to the shelf.</p>
  }
  const idx = PROGRESS_STATUSES.indexOf(order.status)
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Order progress (simulated)">
      {PROGRESS_STATUSES.map((s, k) => (
        <li key={s} className="flex flex-col items-center text-center">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${k <= idx ? 'bg-gold-600 text-white' : 'bg-sand-200 text-ink-500'}`}>
            {k < idx ? <Check className="h-4 w-4" /> : k + 1}
          </span>
          <span className={`mt-1.5 text-[11px] leading-tight sm:text-xs ${k === idx ? 'font-bold text-ink' : 'text-ink-500'}`}>{s}</span>
        </li>
      ))}
    </ol>
  )
}

export default function OrderDetails({ order }) {
  const m = (v) => formatMoney(v, order.currency)
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-ink-500">Order reference</p>
          <p className="font-mono text-lg font-bold">{order.ref}</p>
          <p className="text-sm text-ink-500">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <OrderTimeline order={order} />

      <div className="flex gap-2.5 rounded-xl bg-sky-50 px-4 py-3 text-[13px] leading-relaxed text-sky-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Demonstration record. It is saved only in this browser and is not sent to a real bookstore, payment provider or courier.
      </div>

      <div>
        <h3 className="mb-3 font-sans text-sm font-bold">Items</h3>
        <ul className="divide-y divide-sand-200 rounded-2xl bg-white ring-1 ring-sand-200">
          {order.items.map((it) => (
            <li key={it.bookId} className="flex items-center gap-3 p-3">
              <span className="w-11 shrink-0"><BookImage book={{ title: it.title, author: it.author, isbn: it.isbn, id: it.bookId, summary: '', description: '', highlights: [] }} src={it.cover} className="rounded-[2px]" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{it.title}</span>
                <span className="block text-xs text-ink-500">{it.qty} x {m(it.price)}</span>
              </span>
              <span className="text-sm font-semibold">{m(it.price * it.qty)}</span>
            </li>
          ))}
        </ul>
      </div>

      <dl className="space-y-1.5 rounded-2xl bg-white p-4 text-sm ring-1 ring-sand-200">
        <div className="flex justify-between"><dt className="text-ink-500">Subtotal</dt><dd>{m(order.totals.subtotal)}</dd></div>
        {order.totals.discount > 0 && <div className="flex justify-between text-emerald-800"><dt>Discount{order.coupon ? ` (${order.coupon})` : ''}</dt><dd>-{m(order.totals.discount)}</dd></div>}
        <div className="flex justify-between"><dt className="text-ink-500">Delivery (illustrative)</dt><dd>{order.totals.delivery ? m(order.totals.delivery) : 'Free'}</dd></div>
        <div className="flex justify-between border-t border-sand-200 pt-2 text-base font-bold"><dt>Total (demo)</dt><dd>{m(order.totals.total)}</dd></div>
      </dl>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 text-sm ring-1 ring-sand-200">
          <h3 className="mb-2 font-sans text-sm font-bold">Customer</h3>
          <p>{order.customer.name}</p><p className="text-ink-500">{order.customer.email}</p><p className="text-ink-500">{order.customer.phone}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 text-sm ring-1 ring-sand-200">
          <h3 className="mb-2 font-sans text-sm font-bold">Delivery address</h3>
          <p>{order.delivery.address}</p><p className="text-ink-500">{order.delivery.city}, {order.delivery.country}</p>
          {order.delivery.instructions && <p className="mt-1 text-ink-500">Note: {order.delivery.instructions}</p>}
        </div>
      </div>
      <p className="text-xs text-ink-500">Payment method: {order.payment.label}. No payment was taken.</p>
    </div>
  )
}
