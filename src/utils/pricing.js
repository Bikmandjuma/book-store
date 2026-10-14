import { COUPONS } from '../config'
import { round2 } from './format'

export function findCoupon(code) {
  const c = String(code || '').trim().toUpperCase()
  return COUPONS.find((x) => x.code === c) || null
}

/**
 * lines: [{ book, qty }]. All money is in base currency.
 * Returns totals plus coupon status so the UI can explain why a code did or did not apply.
 */
export function computeTotals(lines, couponCode, settings) {
  const subtotal = round2(lines.reduce((s, l) => s + l.book.price * l.qty, 0))
  const coupon = couponCode ? findCoupon(couponCode) : null
  let discount = 0
  let freeShip = false
  let couponIssue = null
  let appliedCoupon = null

  if (couponCode && !coupon) {
    couponIssue = 'This code is not valid.'
  } else if (coupon) {
    if (subtotal < coupon.minSubtotal) {
      couponIssue = `Add more books to use ${coupon.code} (minimum order applies).`
    } else {
      appliedCoupon = coupon
      if (coupon.type === 'percent') discount = round2((subtotal * coupon.value) / 100)
      if (coupon.type === 'fixed') discount = Math.min(coupon.value, subtotal)
      if (coupon.type === 'shipping') freeShip = true
    }
  }

  discount = Math.min(discount, subtotal)
  let delivery = 0
  if (subtotal > 0) {
    delivery = freeShip || subtotal - discount >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee
  }
  const total = round2(subtotal - discount + delivery)
  return { subtotal, discount, delivery: round2(delivery), total, coupon: appliedCoupon, couponIssue, freeShip }
}
