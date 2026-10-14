import { PAYMENT_METHODS } from '../config'
import { round2 } from './format'

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim())
export const isPhone = (v) => {
  const s = String(v || '').trim()
  if (!/^[+()\d\s-]+$/.test(s)) return false
  const digits = s.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}
const isUrlish = (v) => /^(https?:\/\/|\/|data:image\/)/i.test(v)

export function validateCheckout(v) {
  const e = {}
  if (!v.name || v.name.trim().length < 2) e.name = 'Enter your full name.'
  if (!v.email?.trim()) e.email = 'Enter your email address.'
  else if (!isEmail(v.email)) e.email = 'Enter a valid email address, like name@example.com.'
  if (!v.phone?.trim()) e.phone = 'Enter a phone number.'
  else if (!isPhone(v.phone)) e.phone = 'Enter a valid phone number (7-15 digits, + allowed).'
  if (!v.country) e.country = 'Choose a country.'
  if (!v.city || v.city.trim().length < 2) e.city = 'Enter your city or town.'
  if (!v.address || v.address.trim().length < 5) e.address = 'Enter a delivery address (street, area, landmark).'
  if (!PAYMENT_METHODS.some((p) => p.id === v.payment)) e.payment = 'Choose a demo payment method.'
  return e
}

export function validateReview(v) {
  const e = {}
  if (!v.name || v.name.trim().length < 2) e.name = 'Enter your name.'
  if (!(v.rating >= 1 && v.rating <= 5)) e.rating = 'Choose a star rating.'
  if (!v.text || v.text.trim().length < 10) e.text = 'Write at least 10 characters.'
  if (v.text && v.text.length > 800) e.text = 'Keep your review under 800 characters.'
  return e
}

/** Validates the management book form. Returns { errors, clean }. */
export function validateBookInput(v, categoryIds) {
  const errors = {}
  const title = String(v.title || '').trim()
  if (!title) errors.title = 'Enter a title.'
  const author = String(v.author || '').trim()
  if (!author) errors.author = 'Enter an author.'
  const description = String(v.description || '').trim()
  if (description.length < 20) errors.description = 'Write a description of at least 20 characters.'

  const price = Number(v.price)
  if (String(v.price ?? '').trim() === '' || !Number.isFinite(price) || price <= 0) errors.price = 'Please enter a valid price.'
  let originalPrice = null
  if (String(v.originalPrice ?? '').trim() !== '') {
    originalPrice = Number(v.originalPrice)
    if (!Number.isFinite(originalPrice) || originalPrice <= 0) errors.originalPrice = 'Please enter a valid original price.'
    else if (Number.isFinite(price) && originalPrice <= price) errors.originalPrice = 'Original price must be higher than the selling price.'
  }

  const stock = Number(v.stock)
  if (String(v.stock ?? '').trim() === '' || !Number.isInteger(stock) || stock < 0) errors.stock = 'Stock must be a whole number, 0 or more.'

  const rating = String(v.rating ?? '').trim() === '' ? 0 : Number(v.rating)
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) errors.rating = 'Rating must be between 0 and 5.'
  const reviewCount = String(v.reviewCount ?? '').trim() === '' ? 0 : Number(v.reviewCount)
  if (!Number.isInteger(reviewCount) || reviewCount < 0) errors.reviewCount = 'Review count must be a whole number.'

  const pages = String(v.pages ?? '').trim() === '' ? 0 : Number(v.pages)
  if (!Number.isInteger(pages) || pages < 0) errors.pages = 'Page count must be a whole number.'

  if (!categoryIds.includes(v.category)) errors.category = 'Choose a category.'

  const cover = String(v.cover || '').trim()
  if (cover && !isUrlish(cover)) errors.cover = 'Use a link starting with http(s):// (or leave blank for a generated cover).'

  const gallery = String(v.galleryText || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  if (gallery.some((g) => !isUrlish(g) && !g.startsWith('gen:'))) errors.galleryText = 'Put one image link per line (http(s)://...).'

  const isbn = String(v.isbn || '').trim()
  if (isbn) {
    const digits = isbn.replace(/[-\s]/g, '')
    if (!/^(\d{9}[\dXx]|\d{13})$/.test(digits)) errors.isbn = 'ISBN should have 10 or 13 digits.'
  }
  if (v.publicationDate && Number.isNaN(new Date(v.publicationDate).getTime())) errors.publicationDate = 'Enter a valid date.'

  const highlights = String(v.highlightsText || '').split('\n').map((l) => l.trim()).filter(Boolean)

  const clean = {
    title, author, description,
    subtitle: String(v.subtitle || '').trim(),
    summary: String(v.summary || '').trim() || description.slice(0, 120),
    price: round2(price), originalPrice: originalPrice ? round2(originalPrice) : null,
    stock, rating: Math.round(rating * 10) / 10, reviewCount, pages,
    category: v.category, cover, gallery, isbn,
    publisher: String(v.publisher || '').trim(),
    publicationDate: v.publicationDate || '',
    language: String(v.language || 'English').trim() || 'English',
    format: String(v.format || 'Paperback').trim() || 'Paperback',
    featured: !!v.featured, bestseller: !!v.bestseller,
    authorBio: String(v.authorBio || '').trim(),
    highlights,
    keywords: String(v.keywords || '').trim(),
  }
  return { errors, clean }
}
