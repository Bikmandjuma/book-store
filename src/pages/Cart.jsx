import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useConfirm } from '../context/ConfirmContext'
import useDocumentTitle from '../hooks/useDocumentTitle'
import BookImage from '../components/BookImage'
import EmptyState from '../components/EmptyState'
import { COUPONS } from '../config'
import { plural } from '../utils/format'

export function OrderSummary({ children, showItems = false }) {
  const { totals, money, cartLines, settings, cart } = useStore()
  const toFree = Math.max(0, settings.freeDeliveryThreshold - (totals.subtotal - totals.discount))
  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80 sm:p-6">
      <h2 className="font-display text-3xl font-semibold">Order summary</h2>
      {showItems && (
        <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
          {cartLines.map(({ book, qty }) => (
            <li key={book.id} className="flex items-center gap-3">
              <span className="w-10 shrink-0"><BookImage book={book} className="rounded-[2px]" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{book.title}</span><span className="text-xs text-ink-500">{qty} x {money(book.price)}</span></span>
              <span className="text-sm font-semibold">{money(book.price * qty)}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between"><dt className="text-ink-500">Subtotal</dt><dd className="font-medium">{money(totals.subtotal)}</dd></div>
        <div className="flex justify-between text-emerald-800"><dt>Discount{totals.coupon ? ` (${totals.coupon.code})` : ''}</dt><dd className="font-medium">{totals.discount > 0 ? `-${money(totals.discount)}` : money(0)}</dd></div>
        <div className="flex justify-between"><dt className="text-ink-500">Delivery (illustrative)</dt><dd className="font-medium">{totals.subtotal === 0 ? '-' : totals.delivery ? money(totals.delivery) : 'Free'}</dd></div>
        <div className="flex justify-between border-t border-sand-200 pt-3 text-lg font-bold"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
      </dl>
      {cart.items.length > 0 && toFree > 0 && !totals.freeShip && (
        <p className="mt-3 rounded-xl bg-sand-100 px-3 py-2 text-xs text-ink-700">Add {money(toFree)} more for free delivery.</p>
      )}
      {children}
    </div>
  )
}

export default function Cart() {
  useDocumentTitle('Your cart')
  const navigate = useNavigate()
  const confirm = useConfirm()
  const { cartLines, cart, totals, money, setCartQty, removeFromCart, clearCart, applyCoupon, removeCoupon } = useStore()
  const [code, setCode] = useState('')

  if (cartLines.length === 0) {
    return (
      <div className="container-x py-16">
        <EmptyState icon={ShoppingBag} title="Your cart is empty" text="Books you add will wait here. Start with the bestsellers or browse a category." actionLabel="Browse books" to="/shop" />
      </div>
    )
  }

  const onClear = async () => {
    if (await confirm({ title: 'Clear your cart?', message: 'All books will be removed from your cart.', confirmLabel: 'Clear cart', cancelLabel: 'Keep books', tone: 'danger' })) clearCart()
  }
  const onApply = (e) => {
    e.preventDefault()
    if (applyCoupon(code)) setCode('')
  }
  const unavailable = cartLines.some((l) => l.book.stock < 1)

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-5xl font-medium text-ink-700 sm:text-6xl">Your cart</h1>
        <p className="text-sm text-ink-500">{cartLines.reduce((n, l) => n + l.qty, 0)} {plural(cartLines.reduce((n, l) => n + l.qty, 0), 'item')}</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <section aria-label="Cart items">
          <ul className="space-y-4">
            {cartLines.map(({ book, qty }) => (
              <li key={book.id} className="flex gap-4 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-sand-200/80 sm:gap-5 sm:p-5">
                <Link to={`/books/${book.slug}`} className="w-20 shrink-0 sm:w-24" aria-label={`View ${book.title}`}><BookImage book={book} className="rounded-[3px] shadow-cover" /></Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 font-display text-2xl font-semibold leading-tight"><Link to={`/books/${book.slug}`} className="hover:text-gold-700">{book.title}</Link></h2>
                      <p className="text-sm text-ink-500">by {book.author}</p>
                    </div>
                    <button type="button" onClick={() => removeFromCart(book.id)} aria-label={`Remove ${book.title} from cart`} className="rounded-full p-2 text-ink-500 transition hover:bg-red-50 hover:text-red-700"><Trash2 className="h-[18px] w-[18px]" /></button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <div className="inline-flex items-center rounded-full border border-sand-300" role="group" aria-label={`Quantity for ${book.title}`}>
                      <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-100 disabled:opacity-40" disabled={qty <= 1} onClick={() => setCartQty(book.id, qty - 1)} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                      <output className="w-9 text-center text-sm font-semibold" aria-live="polite">{qty}</output>
                      <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-100 disabled:opacity-40" disabled={qty >= book.stock} onClick={() => setCartQty(book.id, qty + 1)} aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-ink-500">{money(book.price)} each</p>
                      <p className="text-lg font-bold">{money(book.price * qty)}</p>
                    </div>
                  </div>
                  {book.stock <= qty && book.stock > 0 && <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-800"><AlertTriangle className="h-3.5 w-3.5" /> That is all we have in stock.</p>}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Link to="/shop" className="btn btn-outline"><ArrowLeft className="h-4 w-4" /> Continue Shopping</Link>
            <button type="button" onClick={onClear} className="btn btn-ghost text-red-800 hover:!bg-red-50"><Trash2 className="h-4 w-4" /> Clear cart</button>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Summary and promo code">
          <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold"><Tag className="h-5 w-5 text-gold-700" /> Promo code</h2>
            {cart.coupon && totals.coupon ? (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <span><b>{totals.coupon.code}</b> applied: {totals.coupon.label}</span>
                <button type="button" onClick={removeCoupon} aria-label="Remove promo code" className="rounded-full p-1 hover:bg-emerald-100"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <form onSubmit={onApply} className="mt-3" noValidate>
                <label htmlFor="coupon" className="sr-only">Promo code</label>
                <div className="flex gap-2">
                  <input id="coupon" className="input uppercase" placeholder="Enter code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
                  <button type="submit" className="btn btn-dark">Apply</button>
                </div>
              </form>
            )}
            {cart.coupon && totals.couponIssue && <p role="alert" className="mt-2 text-sm font-medium text-amber-800">{totals.couponIssue} <button type="button" onClick={removeCoupon} className="underline">Remove</button></p>}
            <p className="mt-3 text-xs text-ink-500">Sample codes for this demo:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {COUPONS.map((c) => <button key={c.code} type="button" title={c.label} onClick={() => setCode(c.code)} className="chip font-mono">{c.code}</button>)}
            </div>
          </div>

          <OrderSummary>
            {unavailable && <p role="alert" className="mt-3 text-sm font-medium text-red-800">Remove sold-out books to continue.</p>}
            <button type="button" className="btn btn-primary mt-5 w-full !py-3.5" disabled={unavailable} onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
            <p className="mt-3 text-center text-xs text-ink-500">Demo checkout. No real payment is taken.</p>
          </OrderSummary>
        </aside>
      </div>
    </div>
  )
}
