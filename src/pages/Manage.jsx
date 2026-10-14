import { Link, Navigate, useParams } from 'react-router-dom'
import { BookOpen, LayoutDashboard, Package, Settings, ShieldAlert, Tags } from 'lucide-react'
import useDocumentTitle from '../hooks/useDocumentTitle'
import Overview from './manage/Overview'
import BooksAdmin from './manage/BooksAdmin'
import CategoriesAdmin from './manage/CategoriesAdmin'
import OrdersAdmin from './manage/OrdersAdmin'
import SettingsAdmin from './manage/SettingsAdmin'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, C: Overview },
  { id: 'books', label: 'Books', icon: BookOpen, C: BooksAdmin },
  { id: 'categories', label: 'Categories', icon: Tags, C: CategoriesAdmin },
  { id: 'orders', label: 'Orders', icon: Package, C: OrdersAdmin },
  { id: 'settings', label: 'Settings', icon: Settings, C: SettingsAdmin },
]

export default function Manage() {
  const { tab = 'overview' } = useParams()
  const active = TABS.find((t) => t.id === tab)
  useDocumentTitle(`Store management: ${active?.label || ''}`)
  if (!active) return <Navigate to="/manage" replace />
  const { C } = active

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="flex gap-3 rounded-2xl bg-amber-50 px-4 py-3.5 text-sm leading-relaxed text-amber-950 ring-1 ring-amber-200">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <p><b>Demo management area.</b> It has no login and no real access protection, and changes are saved only in this browser. It shows how a bookstore owner could manage the catalogue and orders once a secure backend is added.</p>
      </div>

      <h1 className="mt-6 font-display text-5xl font-medium text-ink-700 sm:text-6xl">Store management</h1>

      <nav aria-label="Management sections" className="scroll-hide -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <Link key={t.id} to={t.id === 'overview' ? '/manage' : `/manage/${t.id}`} aria-current={t.id === active.id ? 'page' : undefined}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${t.id === active.id ? 'bg-ink text-ivory-50' : 'bg-white text-ink-700 ring-1 ring-sand-200 hover:bg-sand-100'}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8"><C /></div>
    </div>
  )
}
