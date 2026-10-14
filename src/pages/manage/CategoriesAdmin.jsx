import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { useConfirm } from '../../context/ConfirmContext'
import Modal from '../../components/Modal'
import { iconFor } from '../../utils/icons'
import { plural } from '../../utils/format'

function CategoryForm({ category, onClose }) {
  const { addCategory, updateCategory } = useStore()
  const [name, setName] = useState(category?.name || '')
  const [description, setDescription] = useState(category?.description || '')
  const [error, setError] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (name.trim().length < 2) { setError('Enter a category name (at least 2 characters).'); return }
    const ok = category ? updateCategory(category.id, { name, description }) : addCategory({ name, description })
    if (ok) onClose()
  }
  return (
    <Modal open onClose={onClose} title={category ? 'Edit category' : 'Add category'} size="sm"
      footer={<div className="flex justify-end gap-2"><button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button><button type="submit" form="cat-form" className="btn btn-primary">{category ? 'Save changes' : 'Add category'}</button></div>}>
      <form id="cat-form" onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label htmlFor="cat-name" className="label">Name</label>
          <input id="cat-name" data-autofocus className={`input ${error ? 'input-error' : ''}`} value={name} onChange={(e) => { setName(e.target.value); setError('') }} />
          {error && <p className="field-error" role="alert">{error}</p>}
        </div>
        <div>
          <label htmlFor="cat-desc" className="label">Description (optional)</label>
          <textarea id="cat-desc" rows={3} className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </form>
    </Modal>
  )
}

export default function CategoriesAdmin() {
  const { categories, books, deleteCategory } = useStore()
  const confirm = useConfirm()
  const [form, setForm] = useState(null)

  const onDelete = async (c) => {
    const n = books.filter((b) => b.category === c.id).length
    if (n > 0) { deleteCategory(c.id); return } // explains why it cannot be deleted
    if (await confirm({ title: 'Delete this category?', message: `Are you sure you want to delete "${c.name}"?`, confirmLabel: 'Delete category', cancelLabel: 'Keep it', tone: 'danger' })) deleteCategory(c.id)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-500">{categories.length} {plural(categories.length, 'category', 'categories')}. Categories with books cannot be deleted.</p>
        <button type="button" className="btn btn-primary" onClick={() => setForm('new')}><Plus className="h-4 w-4" /> Add category</button>
      </div>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const Icon = iconFor(c.icon)
          const n = books.filter((b) => b.category === c.id).length
          return (
            <li key={c.id} className="flex flex-col rounded-3xl bg-white p-5 shadow-soft ring-1 ring-sand-200/80">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sand-100 text-gold-700"><Icon className="h-5 w-5" /></span>
                <div className="flex">
                  <button type="button" className="rounded-full p-2 hover:bg-sand-100" aria-label={`Edit ${c.name}`} onClick={() => setForm(c)}><Pencil className="h-4 w-4" /></button>
                  <button type="button" className="rounded-full p-2 text-red-700 hover:bg-red-50" aria-label={`Delete ${c.name}`} onClick={() => onDelete(c)}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight">{c.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-ink-500">{c.description || 'No description yet.'}</p>
              <p className="mt-auto pt-4 text-xs font-semibold text-gold-700">{n} {plural(n, 'book')}</p>
            </li>
          )
        })}
      </ul>
      {form && <CategoryForm category={form === 'new' ? null : form} onClose={() => setForm(null)} />}
    </div>
  )
}
