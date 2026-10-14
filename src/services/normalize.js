// Turns whatever is in storage (or a form) into safe, complete objects.
import { round2, clamp } from '../utils/format'
import { slugify } from '../utils/id'
import { ORDER_STATUSES, DEFAULT_SETTINGS, CURRENCIES } from '../config'

const num = (v, d = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}
const str = (v, d = '') => (v === undefined || v === null ? d : String(v))
const strArr = (v) => (Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : [])

export function normalizeBook(raw) {
  if (!raw || typeof raw !== 'object') return null
  const title = str(raw.title).trim()
  const price = Number(raw.price)
  if (!title || !Number.isFinite(price) || price <= 0) return null
  const slug = str(raw.slug) || slugify(title)
  const orig = Number(raw.originalPrice)
  return {
    id: str(raw.id) || `bk-${slug}`,
    slug,
    title,
    subtitle: str(raw.subtitle),
    author: str(raw.author, 'Unknown author') || 'Unknown author',
    category: str(raw.category),
    description: str(raw.description) || str(raw.summary),
    summary: str(raw.summary),
    highlights: strArr(raw.highlights),
    authorBio: str(raw.authorBio),
    price: round2(price),
    originalPrice: Number.isFinite(orig) && orig > price ? round2(orig) : null,
    cover: str(raw.cover),
    gallery: strArr(raw.gallery),
    isbn: str(raw.isbn),
    publisher: str(raw.publisher),
    publicationDate: str(raw.publicationDate),
    language: str(raw.language, 'English') || 'English',
    pages: Math.max(0, Math.round(num(raw.pages))),
    format: str(raw.format, 'Paperback') || 'Paperback',
    rating: clamp(num(raw.rating), 0, 5),
    reviewCount: Math.max(0, Math.round(num(raw.reviewCount))),
    stock: Math.max(0, Math.floor(num(raw.stock))),
    featured: !!raw.featured,
    bestseller: !!raw.bestseller,
    editorPick: !!raw.editorPick,
    editorNote: str(raw.editorNote),
    keywords: str(raw.keywords),
    related: strArr(raw.related),
    popularity: num(raw.popularity),
    addedAt: str(raw.addedAt) || new Date().toISOString().slice(0, 10),
  }
}

export function normalizeBooks(list) {
  if (!Array.isArray(list)) return undefined
  const seen = new Set()
  const out = []
  for (const raw of list) {
    const b = normalizeBook(raw)
    if (!b || seen.has(b.id)) continue
    seen.add(b.id)
    out.push(b)
  }
  return out
}

export function normalizeCategories(list) {
  if (!Array.isArray(list)) return undefined
  return list
    .filter((c) => c && typeof c === 'object' && c.id && c.name)
    .map((c) => ({ id: str(c.id), name: str(c.name), icon: str(c.icon, 'compass'), description: str(c.description) }))
}

export function normalizeCart(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.items)) return undefined
  const items = raw.items
    .filter((i) => i && i.bookId && Number.isInteger(Number(i.qty)) && Number(i.qty) > 0)
    .map((i) => ({ bookId: String(i.bookId), qty: Number(i.qty) }))
  return { items, coupon: raw.coupon ? String(raw.coupon) : null }
}

export function normalizeWishlist(raw) {
  if (!Array.isArray(raw)) return undefined
  return [...new Set(raw.map(String))]
}

export function normalizeOrder(raw) {
  if (!raw || typeof raw !== 'object' || !raw.ref || !Array.isArray(raw.items) || !raw.totals) return null
  const status = ORDER_STATUSES.includes(raw.status) ? raw.status : 'Pending'
  return {
    ...raw,
    status,
    items: raw.items.filter((i) => i && i.title).map((i) => ({ ...i, price: num(i.price), qty: Math.max(1, num(i.qty, 1)) })),
    totals: { subtotal: num(raw.totals.subtotal), discount: num(raw.totals.discount), delivery: num(raw.totals.delivery), total: num(raw.totals.total) },
    customer: raw.customer || {},
    delivery: raw.delivery || {},
    payment: raw.payment || { method: 'card', label: 'Demo payment', demo: true },
    currency: raw.currency && raw.currency.code ? raw.currency : { code: 'USD', rate: 1 },
    history: Array.isArray(raw.history) ? raw.history : [{ status, at: raw.createdAt }],
  }
}

export function normalizeOrders(list) {
  if (!Array.isArray(list)) return undefined
  return list.map(normalizeOrder).filter(Boolean)
}

export function normalizeReviews(list) {
  if (!Array.isArray(list)) return undefined
  return list
    .filter((r) => r && r.bookId && r.text)
    .map((r) => ({
      id: str(r.id) || `rv-${Math.random().toString(36).slice(2)}`,
      bookId: str(r.bookId),
      name: str(r.name, 'Reader') || 'Reader',
      rating: clamp(Math.round(num(r.rating, 5)), 1, 5),
      title: str(r.title),
      text: str(r.text),
      date: str(r.date) || new Date().toISOString(),
      demo: r.demo !== false,
    }))
}

export function normalizeSettings(raw) {
  if (!raw || typeof raw !== 'object') return undefined
  const currency = CURRENCIES[raw.currency] ? raw.currency : DEFAULT_SETTINGS.currency
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    currency,
    deliveryFee: Math.max(0, num(raw.deliveryFee, DEFAULT_SETTINGS.deliveryFee)),
    freeDeliveryThreshold: Math.max(0, num(raw.freeDeliveryThreshold, DEFAULT_SETTINGS.freeDeliveryThreshold)),
    customer: { ...DEFAULT_SETTINGS.customer, ...(raw.customer || {}) },
  }
}

export function normalizeNewsletter(list) {
  if (!Array.isArray(list)) return undefined
  return list.filter((n) => n && n.email).map((n) => ({ email: String(n.email), date: str(n.date) }))
}
