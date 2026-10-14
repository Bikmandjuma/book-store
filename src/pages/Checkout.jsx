import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Info, Banknote, Smartphone, ShoppingBag } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useToast } from '../context/ToastContext'
import useDocumentTitle from '../hooks/useDocumentTitle'
import EmptyState from '../components/EmptyState'
import { OrderSummary } from './Cart'
import { COUNTRIES, PAYMENT_METHODS } from '../config'
import { validateCheckout } from '../utils/validation'
import storage from '../services/storage'

const PAY_ICONS = { card: CreditCard, momo: Smartphone, cod: Banknote }

function loadDraft(customer) {
  const r = storage.read('checkout')
  const base = { name: '', email: '', phone: '', country: customer?.country || 'Rwanda', city: '', address: '', instructions: '', payment: 'card' }
  const saved = r.found && !r.invalid && r.value && typeof r.value === 'object' ? r.value : {}
  const profile = customer ? { name: customer.name === 'Demo Reader' ? '' : customer.name, email: customer.email, phone: customer.phone, city: customer.city, address: customer.address } : {}
  return { ...base, ...profile, ...saved }
}

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error ? <p id={`${id}-err`} className="field-error" role="alert">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  )
}

export default function Checkout() {
  useDocumentTitle('Checkout')
  const navigate = useNavigate()
  const toast = useToast()
  const { cartLines, settings, placeOrder } = useStore()
  const [v, setV] = useState(() => loadDraft(settings.customer))
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const done = useRef(false)

  // Keep the typed details so they survive a refresh or a failed order.
  useEffect(() => {
    if (done.current) return undefined
    const t = setTimeout(() => storage.write('checkout', v), 300)
    return () => clearTimeout(t)
  }, [v])

  if (cartLines.length === 0 && !done.current) {
    return (
      <div className="container-x py-16">
        <EmptyState icon={ShoppingBag} title="Nothing to check out yet" text="Add a few books to your cart first." actionLabel="Browse books" to="/shop" />
      </div>
    )
  }

  const set = (k) => (e) => {
    const value = e.target.value
    setV((s) => ({ ...s, [k]: value }))
    if (touched[k] || errors[k]) setErrors((er) => ({ ...er, [k]: validateCheckout({ ...v, [k]: value })[k] }))
  }
  const blur = (k) => () => { setTouched((t) => ({ ...t, [k]: true })); setErrors((er) => ({ ...er, [k]: validateCheckout(v)[k] })) }
  const cls = (k) => `input ${errors[k] ? 'input-error' : ''}`
  const aria = (k) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${k}-err` : undefined, onBlur: blur(k) })

  const submit = (e) => {
    e.preventDefault()
    if (busy) return
    const errs = validateCheckout(v)
    setErrors(errs)
    setTouched(Object.fromEntries(Object.keys(v).map((k) => [k, true])))
    if (Object.keys(errs).length) {
      setFormError('Please fix the highlighted fields and try again.')
      toast.error('Some details need your attention.')
      const first = document.getElementById(Object.keys(errs)[0])
      first?.focus()
      return
    }
    setFormError('')
    setBusy(true)
    const res = placeOrder({
      customer: { name: v.name, email: v.email, phone: v.phone },
      delivery: { country: v.country, city: v.city, address: v.address, instructions: v.instructions },
      payment: v.payment,
    })
    if (!res.ok) {
      setBusy(false)
      setFormError(res.error)
      toast.error(res.error)
      return
    }
    done.current = true
    storage.remove('checkout')
    toast.success('Your demo order has been saved successfully.')
    navigate(`/order/${res.order.ref}`, { replace: true })
  }

  return (
    <div className="container-x py-8 sm:py-12">
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink"><ArrowLeft className="h-4 w-4" /> Back to cart</Link>
      <h1 className="mt-2 font-display text-5xl font-medium text-ink-700 sm:text-6xl">Checkout</h1>

      <div className="mt-5 flex gap-3 rounded-2xl bg-sky-50 px-4 py-3.5 text-sm leading-relaxed text-sky-900">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <p><b>This is a demonstration checkout.</b> No payment is taken, no card details are collected and no order is sent to a real bookstore. Your order is saved only in this browser.</p>
      </div>

      <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          {formError && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-900">{formError}</p>}

          <fieldset className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80 sm:p-6">
            <legend className="px-1 font-display text-3xl font-semibold">Contact</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field id="name" label="Full name" error={errors.name}><input id="name" autoComplete="name" className={cls('name')} value={v.name} onChange={set('name')} {...aria('name')} /></Field></div>
              <Field id="email" label="Email" error={errors.email}><input id="email" type="email" autoComplete="email" className={cls('email')} value={v.email} onChange={set('email')} {...aria('email')} /></Field>
              <Field id="phone" label="Phone number" error={errors.phone} hint="Include your country code, for example +250 7xx xxx xxx"><input id="phone" type="tel" autoComplete="tel" className={cls('phone')} value={v.phone} onChange={set('phone')} {...aria('phone')} /></Field>
            </div>
          </fieldset>

          <fieldset className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80 sm:p-6">
            <legend className="px-1 font-display text-3xl font-semibold">Delivery</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field id="country" label="Country" error={errors.country}>
                <select id="country" autoComplete="country-name" className={cls('country')} value={v.country} onChange={set('country')} {...aria('country')}>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field id="city" label="City or town" error={errors.city}><input id="city" autoComplete="address-level2" className={cls('city')} value={v.city} onChange={set('city')} {...aria('city')} /></Field>
              <div className="sm:col-span-2"><Field id="address" label="Delivery address" error={errors.address}><input id="address" autoComplete="street-address" className={cls('address')} value={v.address} onChange={set('address')} {...aria('address')} placeholder="Street, area, house number or landmark" /></Field></div>
              <div className="sm:col-span-2"><Field id="instructions" label="Delivery instructions (optional)"><textarea id="instructions" rows={3} className="input" value={v.instructions} onChange={set('instructions')} placeholder="Gate code, best time to call, where to leave the parcel" /></Field></div>
            </div>
          </fieldset>

          <fieldset className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80 sm:p-6">
            <legend className="px-1 font-display text-3xl font-semibold">Payment method (demo)</legend>
            <p className="mt-1 text-sm text-ink-500">Choose any option to see how the flow works. Nothing is charged and no payment details are asked for.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map((p) => {
                const Icon = PAY_ICONS[p.id]
                const on = v.payment === p.id
                return (
                  <label key={p.id} className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition focus-within:ring-2 focus-within:ring-gold/40 ${on ? 'border-gold-600 bg-gold-100/50' : 'border-sand-300 hover:border-ink-400'}`}>
                    <span className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-gold-700" />
                      <input type="radio" name="payment" value={p.id} checked={on} onChange={set('payment')} className="h-4 w-4 accent-[#9A6A2F]" />
                    </span>
                    <span className="text-sm font-semibold">{p.label}</span>
                    <span className="text-xs text-ink-500">{p.hint}</span>
                  </label>
                )
              })}
            </div>
            {errors.payment && <p className="field-error" role="alert">{errors.payment}</p>}
          </fieldset>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Order review">
          <OrderSummary showItems>
            <p className="mt-4 text-xs leading-relaxed text-ink-500">By placing this demo order you confirm you understand it is a simulation and no payment will be processed.</p>
            <button type="submit" disabled={busy} className="btn btn-primary mt-4 w-full !py-3.5">{busy ? 'Saving demo order...' : 'Place Demo Order'}</button>
          </OrderSummary>
        </aside>
      </form>
    </div>
  )
}
