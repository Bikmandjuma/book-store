import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import storage from '../services/storage'
import { useToast } from './ToastContext'
import { SEED_BOOKS } from '../data/books'
import { SEED_CATEGORIES } from '../data/categories'
import { SEED_REVIEWS } from '../data/reviews'
import { DEFAULT_SETTINGS, CANCELLABLE, ORDER_STATUSES, CURRENCIES } from '../config'
import { computeTotals, findCoupon } from '../utils/pricing'
import { formatMoney, round2, plural } from '../utils/format'
import { uid, slugify, uniqueSlug } from '../utils/id'
import { buildOrder } from '../services/orders'
import {
  normalizeBook, normalizeBooks, normalizeCategories, normalizeCart, normalizeWishlist,
  normalizeOrders, normalizeReviews, normalizeSettings, normalizeNewsletter,
} from '../services/normalize'
import { isEmail } from '../utils/validation'

const StoreCtx = createContext(null)
const clone = (x) => JSON.parse(JSON.stringify(x))

const SAVE_ERROR = 'Unable to save your changes. Please try again.'

/** Loads one slice. Seeds it only when nothing is saved (or saved data is unreadable). */
function loadSlice(key, seed, normalize, recovered) {
  const r = storage.read(key)
  if (r.found && !r.invalid) {
    const v = normalize(r.value)
    if (v !== undefined) return v
  }
  const fresh = seed()
  if (storage.isAvailable()) storage.write(key, fresh)
  if (r.found) recovered.push(key)
  return fresh
}

export function StoreProvider({ children }) {
  const toast = useToast()
  const recovered = useRef([])

  const [books, setBooks] = useState(() => loadSlice('books', () => clone(SEED_BOOKS), normalizeBooks, recovered.current))
  const [categories, setCategories] = useState(() => loadSlice('categories', () => clone(SEED_CATEGORIES), normalizeCategories, recovered.current))
  const [cart, setCart] = useState(() => loadSlice('cart', () => ({ items: [], coupon: null }), normalizeCart, recovered.current))
  const [wishlist, setWishlist] = useState(() => loadSlice('wishlist', () => [], normalizeWishlist, recovered.current))
  const [orders, setOrders] = useState(() => loadSlice('orders', () => [], normalizeOrders, recovered.current))
  const [reviews, setReviews] = useState(() => loadSlice('reviews', () => clone(SEED_REVIEWS), normalizeReviews, recovered.current))
  const [settings, setSettings] = useState(() => loadSlice('settings', () => clone(DEFAULT_SETTINGS), normalizeSettings, recovered.current))
  const [newsletter, setNewsletter] = useState(() => loadSlice('newsletter', () => [], normalizeNewsletter, recovered.current))

  // Always-current snapshot so several actions in the same tick see each other's changes.
  const S = useRef({})
  S.current = { books, categories, cart, wishlist, orders, reviews, settings, newsletter, }
  const setters = { books: setBooks, categories: setCategories, cart: setCart, wishlist: setWishlist, orders: setOrders, reviews: setReviews, settings: setSettings, newsletter: setNewsletter }
  const placing = useRef(false)

  useEffect(() => {
    if (recovered.current.length) {
      toast.warning('Some saved data could not be read, so sample data was restored for it.')
      recovered.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Update state and persist. Returns true only if the change was really saved. */
  function commit(key, next, { silent = false } = {}) {
    S.current = { ...S.current, [key]: next }
    setters[key](next)
    const ok = storage.write(key, next)
    if (!ok && !silent) toast.error(SAVE_ERROR)
    return ok
  }

  const money = (v) => formatMoney(v, settings.currency)
  const currencyInfo = CURRENCIES[settings.currency] || CURRENCIES.USD
  const bookById = (id) => S.current.books.find((b) => b.id === id)
  const bookBySlug = (slug) => books.find((b) => b.slug === slug)

  // ---------- Derived cart ----------
  const cartLines = useMemo(
    () => cart.items
      .map((it) => {
        const book = books.find((b) => b.id === it.bookId)
        return book ? { book, qty: Math.min(it.qty, Math.max(book.stock, 0)) || it.qty } : null
      })
      .filter(Boolean),
    [cart, books],
  )
  const totals = useMemo(() => computeTotals(cartLines, cart.coupon, settings), [cartLines, cart.coupon, settings])
  const cartCount = cart.items.reduce((n, i) => n + i.qty, 0)

  // ---------- Cart ----------
  function reconcileCart(nextBooks) {
    const cur = S.current.cart
    let changed = false
    const items = []
    for (const it of cur.items) {
      const b = nextBooks.find((x) => x.id === it.bookId)
      if (!b || b.stock < 1) { changed = true; continue }
      const q = Math.min(it.qty, b.stock)
      if (q !== it.qty) changed = true
      items.push({ bookId: it.bookId, qty: q })
    }
    if (changed) {
      commit('cart', { ...cur, items })
      toast.info('Your cart was updated to match available stock.')
    }
  }

  function addToCart(bookId, qty = 1) {
    const book = bookById(bookId)
    const n = Number(qty)
    if (!book) { toast.error('This book is no longer available.'); return false }
    if (!Number.isInteger(n) || n < 1) { toast.error('Please choose a valid quantity.'); return false }
    if (book.stock < 1) { toast.error('This book is out of stock.'); return false }
    const cur = S.current.cart
    const existing = cur.items.find((i) => i.bookId === bookId)
    const have = existing ? existing.qty : 0
    if (have >= book.stock) {
      toast.warning(`Your cart already has all ${book.stock} available ${plural(book.stock, 'copy', 'copies')}.`)
      return false
    }
    const nextQty = Math.min(have + n, book.stock)
    const items = existing
      ? cur.items.map((i) => (i.bookId === bookId ? { ...i, qty: nextQty } : i))
      : [...cur.items, { bookId, qty: nextQty }]
    const ok = commit('cart', { ...cur, items })
    if (ok) {
      if (have + n > book.stock) toast.warning(`Only ${book.stock} ${plural(book.stock, 'copy', 'copies')} in stock. We added the maximum.`)
      else toast.success('Book added to your cart.')
    }
    return true
  }

  function setCartQty(bookId, qty) {
    const book = bookById(bookId)
    const cur = S.current.cart
    const n = Math.floor(Number(qty))
    if (!book || !Number.isFinite(n)) { toast.error('Please choose a valid quantity.'); return false }
    if (n < 1) { toast.error('Quantity must be at least 1. Use Remove to delete an item.'); return false }
    let next = n
    if (n > book.stock) {
      next = book.stock
      toast.warning(`Only ${book.stock} ${plural(book.stock, 'copy', 'copies')} in stock.`)
    }
    return commit('cart', { ...cur, items: cur.items.map((i) => (i.bookId === bookId ? { ...i, qty: next } : i)) })
  }

  function removeFromCart(bookId) {
    const cur = S.current.cart
    const ok = commit('cart', { ...cur, items: cur.items.filter((i) => i.bookId !== bookId) })
    if (ok) toast.success('Book removed from your cart.')
  }

  function clearCart() {
    const ok = commit('cart', { items: [], coupon: null })
    if (ok) toast.success('Your cart is now empty.')
  }

  function applyCoupon(code) {
    const c = findCoupon(code)
    if (!String(code || '').trim()) { toast.error('Enter a promo code first.'); return false }
    if (!c) { toast.error('That promo code is not valid. Try one of the sample codes shown below.'); return false }
    const t = computeTotals(
      S.current.cart.items.map((i) => ({ book: bookById(i.bookId), qty: i.qty })).filter((l) => l.book),
      c.code, S.current.settings,
    )
    if (t.couponIssue) { toast.warning(t.couponIssue); return false }
    const ok = commit('cart', { ...S.current.cart, coupon: c.code })
    if (ok) toast.success(`${c.code} applied: ${c.label}.`)
    return ok
  }

  function removeCoupon() {
    const ok = commit('cart', { ...S.current.cart, coupon: null })
    if (ok) toast.info('Promo code removed.')
  }

  // ---------- Wishlist ----------
  function toggleWishlist(bookId) {
    const cur = S.current.wishlist
    const has = cur.includes(bookId)
    const ok = commit('wishlist', has ? cur.filter((x) => x !== bookId) : [...cur, bookId])
    if (ok) toast.success(has ? 'Removed from your wishlist.' : 'Added to your wishlist.')
  }
  const isWishlisted = (id) => wishlist.includes(id)

  function moveToCart(bookId) {
    if (addToCart(bookId, 1)) commit('wishlist', S.current.wishlist.filter((x) => x !== bookId), { silent: true })
  }

  function clearWishlist() {
    if (commit('wishlist', [])) toast.success('Your wishlist has been cleared.')
  }

  // ---------- Books (management) ----------
  function addBook(clean) {
    const taken = new Set(S.current.books.map((b) => b.slug))
    const slug = uniqueSlug(clean.title, taken)
    const book = normalizeBook({
      ...clean, id: uid('bk'), slug,
      cover: clean.cover, gallery: clean.gallery.length ? clean.gallery : [clean.cover, 'gen:back', 'gen:quote'].filter(Boolean),
      popularity: 50, related: [], addedAt: new Date().toISOString().slice(0, 10),
    })
    if (!book) { toast.error('Please enter a valid price.'); return false }
    const ok = commit('books', [book, ...S.current.books])
    if (ok) toast.success('Book added to the catalogue.')
    return ok
  }

  function updateBook(id, patch, message = 'Book details updated successfully.') {
    const cur = S.current.books
    const existing = cur.find((b) => b.id === id)
    if (!existing) { toast.error('That book could not be found.'); return false }
    const merged = normalizeBook({ ...existing, ...patch, id: existing.id, slug: existing.slug })
    if (!merged) { toast.error('Please enter a valid price.'); return false }
    const next = cur.map((b) => (b.id === id ? merged : b))
    const ok = commit('books', next)
    if (ok) { if (message) toast.success(message); reconcileCart(next) }
    return ok
  }

  function deleteBook(id) {
    const cur = S.current.books
    const next = cur.filter((b) => b.id !== id)
    const ok = commit('books', next)
    if (ok) {
      commit('wishlist', S.current.wishlist.filter((x) => x !== id), { silent: true })
      reconcileCart(next)
      toast.success('Book deleted from the catalogue.')
    }
    return ok
  }

  function applyDiscount(id, percent) {
    const b = bookById(id)
    const p = Number(percent)
    if (!b) return false
    if (!Number.isFinite(p) || p <= 0 || p >= 90) { toast.error('Enter a discount between 1% and 89%.'); return false }
    const original = b.originalPrice || b.price
    return updateBook(id, { originalPrice: original, price: round2(original * (1 - p / 100)) }, `${p}% discount applied.`)
  }

  function removeDiscount(id) {
    const b = bookById(id)
    if (!b || !b.originalPrice) return false
    return updateBook(id, { price: b.originalPrice, originalPrice: null }, 'Discount removed.')
  }

  const toggleFeatured = (id) => {
    const b = bookById(id)
    if (b) updateBook(id, { featured: !b.featured }, b.featured ? 'Removed from featured books.' : 'Marked as a featured book.')
  }

  // ---------- Categories ----------
  function addCategory({ name, description }) {
    const n = String(name || '').trim()
    if (n.length < 2) { toast.error('Enter a category name (at least 2 characters).'); return false }
    if (S.current.categories.some((c) => c.name.toLowerCase() === n.toLowerCase())) { toast.error('A category with this name already exists.'); return false }
    const taken = new Set(S.current.categories.map((c) => c.id))
    const cat = { id: uniqueSlug(n, taken), name: n, icon: 'compass', description: String(description || '').trim() }
    const ok = commit('categories', [...S.current.categories, cat])
    if (ok) toast.success('Category added.')
    return ok
  }

  function updateCategory(id, { name, description }) {
    const n = String(name || '').trim()
    if (n.length < 2) { toast.error('Enter a category name (at least 2 characters).'); return false }
    if (S.current.categories.some((c) => c.id !== id && c.name.toLowerCase() === n.toLowerCase())) { toast.error('A category with this name already exists.'); return false }
    const ok = commit('categories', S.current.categories.map((c) => (c.id === id ? { ...c, name: n, description: String(description || '').trim() } : c)))
    if (ok) toast.success('Category updated successfully.')
    return ok
  }

  function deleteCategory(id) {
    const used = S.current.books.filter((b) => b.category === id).length
    if (used > 0) {
      toast.error(`This category still has ${used} ${plural(used, 'book')}. Move or delete them first.`)
      return false
    }
    const ok = commit('categories', S.current.categories.filter((c) => c.id !== id))
    if (ok) toast.success('Category deleted.')
    return ok
  }

  // ---------- Orders ----------
  function placeOrder({ customer, delivery, payment }) {
    if (placing.current) return { ok: false, error: 'Your order is already being placed.' }
    const cur = S.current
    const lines = cur.cart.items.map((i) => ({ book: cur.books.find((b) => b.id === i.bookId), qty: i.qty })).filter((l) => l.book)
    if (!lines.length) return { ok: false, error: 'Your cart is empty.' }
    for (const l of lines) {
      if (l.book.stock < 1) return { ok: false, error: `"${l.book.title}" is now out of stock. Please remove it from your cart.` }
      if (l.book.stock < l.qty) return { ok: false, error: `Only ${l.book.stock} ${plural(l.book.stock, 'copy', 'copies')} of "${l.book.title}" left. Please update your cart.` }
    }
    placing.current = true
    setTimeout(() => { placing.current = false }, 800)

    const t = computeTotals(lines, cur.cart.coupon, cur.settings)
    const order = buildOrder({ lines, totals: t, couponCode: cur.cart.coupon, customer, delivery, payment, currency: CURRENCIES[cur.settings.currency] || CURRENCIES.USD })
    const nextOrders = [order, ...cur.orders]

    // The order itself must really be saved before we claim success or clear the cart.
    if (!storage.write('orders', nextOrders)) {
      return { ok: false, error: 'Unable to save your order. Your details are still here, so please try again.' }
    }
    S.current = { ...S.current, orders: nextOrders }
    setOrders(nextOrders)

    const nextBooks = cur.books.map((b) => {
      const l = lines.find((x) => x.book.id === b.id)
      return l ? { ...b, stock: b.stock - l.qty, popularity: b.popularity + l.qty } : b
    })
    commit('books', nextBooks, { silent: true })
    commit('cart', { items: [], coupon: null }, { silent: true })
    commit('settings', { ...S.current.settings, customer: { name: customer.name.trim(), email: customer.email.trim(), phone: customer.phone.trim(), country: delivery.country, city: delivery.city.trim(), address: delivery.address.trim() } }, { silent: true })
    return { ok: true, order }
  }

  function restoreStock(order) {
    return S.current.books.map((b) => {
      const it = order.items.find((i) => i.bookId === b.id)
      return it ? { ...b, stock: b.stock + it.qty } : b
    })
  }

  function setOrderStatus(ref, status, message) {
    const order = S.current.orders.find((o) => o.ref === ref)
    if (!order || !ORDER_STATUSES.includes(status)) return false
    if (order.status === status) return true
    if (order.status === 'Cancelled') { toast.warning('Cancelled orders cannot be changed.'); return false }
    const at = new Date().toISOString()
    const nextOrders = S.current.orders.map((o) => (o.ref === ref ? { ...o, status, history: [...o.history, { status, at }] } : o))
    const ok = commit('orders', nextOrders)
    if (!ok) return false
    if (status === 'Cancelled') commit('books', restoreStock(order), { silent: true })
    toast.success(message || `Demo order status changed to ${status}.`)
    return true
  }

  function cancelOrder(ref) {
    const order = S.current.orders.find((o) => o.ref === ref)
    if (!order) return false
    if (!CANCELLABLE.includes(order.status)) { toast.error(`Orders that are ${order.status.toLowerCase()} can no longer be cancelled.`); return false }
    return setOrderStatus(ref, 'Cancelled', 'Demo order cancelled.')
  }

  // ---------- Reviews ----------
  function addReview({ bookId, name, rating, title, text }) {
    const book = bookById(bookId)
    if (!book) return false
    const dup = S.current.reviews.some((r) => r.bookId === bookId && r.name === name.trim() && r.text === text.trim())
    if (dup) { toast.warning('You have already submitted this review.'); return false }
    const review = { id: uid('rv'), bookId, name: name.trim(), rating, title: String(title || '').trim(), text: text.trim(), date: new Date().toISOString(), demo: true }
    const ok = commit('reviews', [review, ...S.current.reviews])
    if (!ok) return false
    const count = book.reviewCount
    const nextRating = Math.round(((book.rating * count + rating) / (count + 1)) * 10) / 10
    commit('books', S.current.books.map((b) => (b.id === bookId ? { ...b, rating: nextRating, reviewCount: count + 1 } : b)), { silent: true })
    toast.success('Thanks! Your demo review has been saved in this browser.')
    return true
  }

  // ---------- Newsletter & settings ----------
  function subscribe(email) {
    const e = String(email || '').trim().toLowerCase()
    if (!isEmail(e)) { toast.error('Enter a valid email address to subscribe.'); return false }
    if (S.current.newsletter.some((n) => n.email === e)) { toast.info('This email is already on the list.'); return true }
    const ok = commit('newsletter', [...S.current.newsletter, { email: e, date: new Date().toISOString() }])
    if (ok) toast.success('You are on the list. This is a demo, so no email will be sent.')
    return ok
  }

  function updateSettings(patch, message = 'Settings saved.') {
    const next = normalizeSettings({ ...S.current.settings, ...patch })
    const ok = commit('settings', next)
    if (ok && message) toast.success(message)
    return ok
  }

  function restoreSampleCatalogue() {
    const b = commit('books', clone(SEED_BOOKS), { silent: true })
    const c = commit('categories', clone(SEED_CATEGORIES), { silent: true })
    commit('wishlist', S.current.wishlist.filter((id) => SEED_BOOKS.some((x) => x.id === id)), { silent: true })
    reconcileCart(S.current.books)
    if (b && c) toast.success('Sample catalogue restored.')
    else toast.error(SAVE_ERROR)
  }

  function resetAllDemoData() {
    const results = [
      commit('books', clone(SEED_BOOKS), { silent: true }),
      commit('categories', clone(SEED_CATEGORIES), { silent: true }),
      commit('reviews', clone(SEED_REVIEWS), { silent: true }),
      commit('cart', { items: [], coupon: null }, { silent: true }),
      commit('wishlist', [], { silent: true }),
      commit('orders', [], { silent: true }),
      commit('newsletter', [], { silent: true }),
      commit('settings', clone(DEFAULT_SETTINGS), { silent: true }),
    ]
    storage.remove('checkout')
    if (results.every(Boolean)) toast.success('All demo data has been reset.')
    else toast.error(SAVE_ERROR)
  }

  const value = {
    books, categories, cart, cartLines, totals, cartCount, wishlist, orders, reviews, settings, newsletter,
    storageOk: storage.isAvailable(), money, currencyInfo, bookBySlug, bookById,
    addToCart, setCartQty, removeFromCart, clearCart, applyCoupon, removeCoupon,
    toggleWishlist, isWishlisted, moveToCart, clearWishlist,
    addBook, updateBook, deleteBook, applyDiscount, removeDiscount, toggleFeatured,
    addCategory, updateCategory, deleteCategory,
    placeOrder, cancelOrder, setOrderStatus, addReview, subscribe, updateSettings,
    restoreSampleCatalogue, resetAllDemoData,
  }

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
