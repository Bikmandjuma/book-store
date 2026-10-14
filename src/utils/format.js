import { CURRENCIES } from '../config'

function resolveCurrency(currency) {
  if (currency && typeof currency === 'object' && currency.code) {
    return { code: currency.code, rate: Number(currency.rate) || CURRENCIES[currency.code]?.rate || 1 }
  }
  return CURRENCIES[currency] || CURRENCIES.USD
}

/** Format a base-currency (USD) amount in the chosen display currency. */
export function formatMoney(valueBase, currency = 'USD') {
  const c = resolveCurrency(currency)
  const n = Number(valueBase)
  const v = (Number.isFinite(n) ? n : 0) * c.rate
  const zeroDecimals = c.rate >= 100
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: c.code,
      minimumFractionDigits: zeroDecimals ? 0 : 2,
      maximumFractionDigits: zeroDecimals ? 0 : 2,
    }).format(v)
  } catch {
    return `${c.code} ${v.toFixed(zeroDecimals ? 0 : 2)}`
  }
}

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

export function discountPercent(price, original) {
  if (!original || original <= price) return 0
  return Math.round((1 - price / original) * 100)
}

export function formatDate(iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('en-GB', opts)
}

export function formatDateTime(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function deliveryWindow(minDays = 3, maxDays = 6) {
  const a = new Date()
  const b = new Date()
  a.setDate(a.getDate() + minDays)
  b.setDate(b.getDate() + maxDays)
  const f = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  return `${f(a)} to ${f(b)}`
}

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
export const plural = (n, one, many = `${one}s`) => (n === 1 ? one : many)
