import { useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { useConfirm } from '../../context/ConfirmContext'
import { CURRENCIES } from '../../config'

export default function SettingsAdmin() {
  const { settings, updateSettings, restoreSampleCatalogue, resetAllDemoData, newsletter } = useStore()
  const confirm = useConfirm()
  const [v, setV] = useState({
    storeName: settings.storeName, currency: settings.currency, deliveryFee: String(settings.deliveryFee),
    freeDeliveryThreshold: String(settings.freeDeliveryThreshold), contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone, address: settings.address,
  })
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }))

  const save = (e) => {
    e.preventDefault()
    const errs = {}
    if (!v.storeName.trim()) errs.storeName = 'Enter a store name.'
    const fee = Number(v.deliveryFee)
    if (v.deliveryFee === '' || !Number.isFinite(fee) || fee < 0) errs.deliveryFee = 'Please enter a valid delivery fee (0 or more).'
    const thr = Number(v.freeDeliveryThreshold)
    if (v.freeDeliveryThreshold === '' || !Number.isFinite(thr) || thr < 0) errs.freeDeliveryThreshold = 'Please enter a valid amount (0 or more).'
    setErrors(errs)
    if (Object.keys(errs).length) return
    updateSettings({ ...v, storeName: v.storeName.trim(), deliveryFee: fee, freeDeliveryThreshold: thr })
  }

  const restore = async () => {
    if (await confirm({ title: 'Restore the sample catalogue?', message: 'Books and categories return to the original sample data. Your orders, reviews and settings are kept. Any books you added or edited will be lost.', confirmLabel: 'Restore catalogue', cancelLabel: 'Cancel', tone: 'danger' })) restoreSampleCatalogue()
  }
  const reset = async () => {
    if (await confirm({ title: 'Reset all demo data?', message: 'This clears your cart, wishlist, orders, reviews, newsletter sign-ups and settings, and restores the sample catalogue. It cannot be undone.', confirmLabel: 'Reset everything', cancelLabel: 'Cancel', tone: 'danger', requireText: 'RESET' })) resetAllDemoData()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <form onSubmit={save} noValidate className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80 sm:p-6">
        <h2 className="font-display text-3xl font-semibold">Store settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="s-name" className="label">Store name</label>
            <input id="s-name" className={`input ${errors.storeName ? 'input-error' : ''}`} value={v.storeName} onChange={set('storeName')} />
            {errors.storeName && <p className="field-error">{errors.storeName}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="s-cur" className="label">Display currency</label>
            <select id="s-cur" className="input" value={v.currency} onChange={set('currency')}>
              {Object.values(CURRENCIES).map((c) => <option key={c.code} value={c.code}>{c.code} - {c.label}</option>)}
            </select>
            <p className="hint">Sample prices are written in USD and converted for display using illustrative rates, not live exchange rates.</p>
          </div>
          <div>
            <label htmlFor="s-fee" className="label">Delivery fee (USD base)</label>
            <input id="s-fee" type="number" step="0.01" min="0" className={`input ${errors.deliveryFee ? 'input-error' : ''}`} value={v.deliveryFee} onChange={set('deliveryFee')} />
            {errors.deliveryFee && <p className="field-error">{errors.deliveryFee}</p>}
          </div>
          <div>
            <label htmlFor="s-free" className="label">Free delivery over (USD base)</label>
            <input id="s-free" type="number" step="0.01" min="0" className={`input ${errors.freeDeliveryThreshold ? 'input-error' : ''}`} value={v.freeDeliveryThreshold} onChange={set('freeDeliveryThreshold')} />
            {errors.freeDeliveryThreshold && <p className="field-error">{errors.freeDeliveryThreshold}</p>}
          </div>
          <div><label htmlFor="s-mail" className="label">Contact email</label><input id="s-mail" className="input" value={v.contactEmail} onChange={set('contactEmail')} /></div>
          <div><label htmlFor="s-phone" className="label">Contact phone</label><input id="s-phone" className="input" value={v.contactPhone} onChange={set('contactPhone')} /></div>
          <div className="sm:col-span-2"><label htmlFor="s-addr" className="label">Store address</label><input id="s-addr" className="input" value={v.address} onChange={set('address')} /></div>
        </div>
        <button type="submit" className="btn btn-primary mt-5">Save settings</button>
      </form>

      <div className="space-y-4">
        <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80 sm:p-6">
          <h2 className="font-display text-3xl font-semibold">Demo data</h2>
          <p className="mt-1 text-sm text-ink-500">Everything lives in this browser&apos;s LocalStorage. {newsletter.length} newsletter {newsletter.length === 1 ? 'sign-up' : 'sign-ups'} saved.</p>
          <div className="mt-4 space-y-3">
            <button type="button" className="btn btn-outline w-full" onClick={restore}><RotateCcw className="h-4 w-4" /> Restore sample catalogue</button>
            <button type="button" className="btn btn-danger w-full" onClick={reset}><Trash2 className="h-4 w-4" /> Reset all demo data</button>
          </div>
        </section>
        <section className="rounded-3xl bg-sand-100 p-5 text-sm leading-relaxed text-ink-700 sm:p-6">
          <h2 className="font-display text-2xl font-semibold">Sample promo codes</h2>
          <p className="mt-1">WELCOME10, READ15 (orders over 40), BOOKWORM5 (orders over 25) and FREESHIP. Edit them in <code className="rounded bg-white px-1.5 py-0.5 text-xs">src/config.js</code>.</p>
        </section>
      </div>
    </div>
  )
}
