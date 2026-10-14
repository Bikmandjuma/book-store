import { useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import BookImage from '../../components/BookImage'
import { useStore } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import { validateBookInput } from '../../utils/validation'

const FORMATS = ['Paperback', 'Hardcover', 'E-book', 'Audiobook']

function toForm(b) {
  if (!b) {
    return {
      title: '', subtitle: '', author: '', description: '', summary: '', price: '', originalPrice: '', cover: '', galleryText: '',
      category: '', isbn: '', publisher: '', publicationDate: '', language: 'English', pages: '', format: 'Paperback',
      rating: '', reviewCount: '0', stock: '10', featured: false, bestseller: false, authorBio: '', highlightsText: '', keywords: '',
    }
  }
  return {
    title: b.title, subtitle: b.subtitle, author: b.author, description: b.description, summary: b.summary,
    price: String(b.price), originalPrice: b.originalPrice ? String(b.originalPrice) : '', cover: b.cover,
    galleryText: b.gallery.join('\n'), category: b.category, isbn: b.isbn, publisher: b.publisher,
    publicationDate: b.publicationDate, language: b.language, pages: b.pages ? String(b.pages) : '', format: b.format,
    rating: String(b.rating), reviewCount: String(b.reviewCount), stock: String(b.stock), featured: b.featured,
    bestseller: b.bestseller, authorBio: b.authorBio, highlightsText: b.highlights.join('\n'), keywords: b.keywords,
  }
}

function F({ id, label, error, hint, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error ? <p className="field-error" role="alert">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  )
}

export default function BookForm({ book, onClose }) {
  const { categories, addBook, updateBook, currencyInfo } = useStore()
  const toast = useToast()
  const [v, setV] = useState(() => toForm(book))
  const [errors, setErrors] = useState({})
  const editing = !!book

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const cls = (k) => `input ${errors[k] ? 'input-error' : ''}`
  const previewBook = useMemo(() => ({ ...(book || {}), id: book?.id || 'preview', title: v.title || 'Untitled', author: v.author || 'Author', isbn: v.isbn, summary: v.summary, description: v.description, highlights: [] }), [book, v.title, v.author, v.isbn, v.summary, v.description])

  const submit = (e) => {
    e.preventDefault()
    const { errors: errs, clean } = validateBookInput(v, categories.map((c) => c.id))
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast.error(errs.price || 'Please fix the highlighted fields.')
      document.getElementById(`bf-${Object.keys(errs)[0]}`)?.focus()
      return
    }
    const payload = { ...clean, gallery: clean.gallery.length ? clean.gallery : [clean.cover, 'gen:back', 'gen:quote'].filter(Boolean) }
    const ok = editing ? updateBook(book.id, payload) : addBook(payload)
    if (ok) onClose()
  }

  return (
    <Modal open onClose={onClose} title={editing ? 'Edit book' : 'Add a book'} size="xl"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" form="book-form" className="btn btn-primary">{editing ? 'Save changes' : 'Add book'}</button>
        </div>
      }>
      <form id="book-form" onSubmit={submit} noValidate className="grid gap-5 lg:grid-cols-[1fr_15rem]">
        <div className="grid gap-4 sm:grid-cols-2">
          <F id="bf-title" label="Title" error={errors.title} className="sm:col-span-2"><input id="bf-title" className={cls('title')} value={v.title} onChange={set('title')} /></F>
          <F id="bf-subtitle" label="Subtitle (optional)" className="sm:col-span-2"><input id="bf-subtitle" className="input" value={v.subtitle} onChange={set('subtitle')} /></F>
          <F id="bf-author" label="Author" error={errors.author}><input id="bf-author" className={cls('author')} value={v.author} onChange={set('author')} /></F>
          <F id="bf-category" label="Category" error={errors.category}>
            <select id="bf-category" className={cls('category')} value={v.category} onChange={set('category')}>
              <option value="">Choose a category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </F>
          <F id="bf-summary" label="Short summary" hint="One line shown on book cards." className="sm:col-span-2"><input id="bf-summary" className="input" value={v.summary} onChange={set('summary')} /></F>
          <F id="bf-description" label="Description" error={errors.description} className="sm:col-span-2"><textarea id="bf-description" rows={5} className={cls('description')} value={v.description} onChange={set('description')} /></F>
          <F id="bf-highlights" label="Key highlights" hint="One per line." className="sm:col-span-2"><textarea id="bf-highlights" rows={3} className="input" value={v.highlightsText} onChange={set('highlightsText')} /></F>

          <F id="bf-price" label="Selling price (USD base)" error={errors.price} hint={currencyInfo.code !== 'USD' ? `Shown to customers in ${currencyInfo.code}.` : undefined}><input id="bf-price" type="number" step="0.01" min="0" inputMode="decimal" className={cls('price')} value={v.price} onChange={set('price')} /></F>
          <F id="bf-originalPrice" label="Original price (optional)" error={errors.originalPrice} hint="Set higher than the selling price to show a discount."><input id="bf-originalPrice" type="number" step="0.01" min="0" inputMode="decimal" className={cls('originalPrice')} value={v.originalPrice} onChange={set('originalPrice')} /></F>
          <F id="bf-stock" label="Stock quantity" error={errors.stock}><input id="bf-stock" type="number" step="1" min="0" className={cls('stock')} value={v.stock} onChange={set('stock')} /></F>
          <F id="bf-format" label="Format"><select id="bf-format" className="input" value={v.format} onChange={set('format')}>{FORMATS.map((f) => <option key={f}>{f}</option>)}</select></F>

          <F id="bf-cover" label="Cover image URL" error={errors.cover} hint="Leave blank to use a generated cover." className="sm:col-span-2"><input id="bf-cover" className={cls('cover')} value={v.cover} onChange={set('cover')} placeholder="https://..." /></F>
          <F id="bf-galleryText" label="Gallery image URLs" error={errors.galleryText} hint="One per line. Use gen:back or gen:quote for generated panels." className="sm:col-span-2"><textarea id="bf-galleryText" rows={3} className={cls('galleryText')} value={v.galleryText} onChange={set('galleryText')} /></F>

          <F id="bf-isbn" label="ISBN" error={errors.isbn}><input id="bf-isbn" className={cls('isbn')} value={v.isbn} onChange={set('isbn')} /></F>
          <F id="bf-publisher" label="Publisher"><input id="bf-publisher" className="input" value={v.publisher} onChange={set('publisher')} /></F>
          <F id="bf-publicationDate" label="Publication date" error={errors.publicationDate}><input id="bf-publicationDate" type="date" className={cls('publicationDate')} value={v.publicationDate} onChange={set('publicationDate')} /></F>
          <F id="bf-language" label="Language"><input id="bf-language" className="input" value={v.language} onChange={set('language')} /></F>
          <F id="bf-pages" label="Page count" error={errors.pages}><input id="bf-pages" type="number" min="0" className={cls('pages')} value={v.pages} onChange={set('pages')} /></F>
          <F id="bf-keywords" label="Search keywords"><input id="bf-keywords" className="input" value={v.keywords} onChange={set('keywords')} placeholder="habits focus routine" /></F>
          <F id="bf-rating" label="Demo rating (0 to 5)" error={errors.rating}><input id="bf-rating" type="number" step="0.1" min="0" max="5" className={cls('rating')} value={v.rating} onChange={set('rating')} /></F>
          <F id="bf-reviewCount" label="Demo review count" error={errors.reviewCount}><input id="bf-reviewCount" type="number" min="0" className={cls('reviewCount')} value={v.reviewCount} onChange={set('reviewCount')} /></F>
          <F id="bf-authorBio" label="Author biography" className="sm:col-span-2"><textarea id="bf-authorBio" rows={2} className="input" value={v.authorBio} onChange={set('authorBio')} /></F>

          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm"><input type="checkbox" className="h-4 w-4 accent-[#9A6A2F]" checked={v.featured} onChange={set('featured')} /> Featured book (hero carousel)</label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm"><input type="checkbox" className="h-4 w-4 accent-[#9A6A2F]" checked={v.bestseller} onChange={set('bestseller')} /> Bestseller badge</label>
          </div>
        </div>

        <aside className="hidden lg:block" aria-label="Cover preview">
          <div className="sticky top-0 rounded-2xl bg-sand-100 p-4">
            <p className="mb-3 text-xs font-semibold text-ink-500">Cover preview</p>
            <BookImage key={v.cover} book={previewBook} src={v.cover} className="rounded-[3px] shadow-cover" />
          </div>
        </aside>
      </form>
    </Modal>
  )
}
