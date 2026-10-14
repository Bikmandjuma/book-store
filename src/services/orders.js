import { makeOrderRef } from '../utils/id'
import { PAYMENT_METHODS } from '../config'

/** Builds the complete order record that is saved to LocalStorage. */
export function buildOrder({ lines, totals, couponCode, customer, delivery, payment, currency }) {
  const now = new Date().toISOString()
  const method = PAYMENT_METHODS.find((p) => p.id === payment) || PAYMENT_METHODS[0]
  return {
    id: `ord_${Date.now().toString(36)}`,
    ref: makeOrderRef(),
    createdAt: now,
    status: 'Pending',
    demo: true,
    items: lines.map(({ book, qty }) => ({
      bookId: book.id, slug: book.slug, title: book.title, author: book.author,
      cover: book.cover, isbn: book.isbn, price: book.price, qty,
    })),
    totals: { subtotal: totals.subtotal, discount: totals.discount, delivery: totals.delivery, total: totals.total },
    coupon: totals.coupon ? totals.coupon.code : couponCode && !totals.couponIssue ? couponCode : null,
    customer: { name: customer.name.trim(), email: customer.email.trim(), phone: customer.phone.trim() },
    delivery: {
      country: delivery.country, city: delivery.city.trim(),
      address: delivery.address.trim(), instructions: (delivery.instructions || '').trim(),
    },
    payment: { method: method.id, label: method.label, demo: true },
    currency: { code: currency.code, rate: currency.rate },
    history: [{ status: 'Pending', at: now }],
  }
}
