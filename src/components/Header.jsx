import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Menu, Search, ShoppingBag, ChevronDown, Package, Settings, User, X } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { initials } from '../utils/id'
import SearchBox from './SearchBox'
import Modal from './Modal'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/wishlist', label: 'Wishlist' },
  { to: '/orders', label: 'My Orders' },
]

export function Logo({ light = false }) {
  return (
    <Link to="/" className="inline-flex items-baseline" aria-label="Booksta.store home">
      <span className={`font-display text-[30px] font-bold italic leading-none tracking-tight ${light ? 'text-ivory-50' : 'text-gold-700'}`}>Booksta</span>
      <span className={`font-display text-[22px] font-medium leading-none ${light ? 'text-ivory-50/70' : 'text-ink-500'}`}>.store</span>
    </Link>
  )
}

function Badge({ n }) {
  if (!n) return null
  return (
    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold-600 px-1 text-[11px] font-bold leading-none text-white" aria-hidden="true">
      {n > 99 ? '99+' : n}
    </span>
  )
}

export default function Header() {
  const { cartCount, wishlist, settings } = useStore()
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const [profile, setProfile] = useState(false)
  const profRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const name = settings.customer?.name || 'Demo Reader'

  useEffect(() => { setMenu(false); setSearch(false); setProfile(false) }, [location.pathname])

  useEffect(() => {
    const away = (e) => { if (profRef.current && !profRef.current.contains(e.target)) setProfile(false) }
    const esc = (e) => { if (e.key === 'Escape') setProfile(false) }
    document.addEventListener('mousedown', away)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc) }
  }, [])

  const linkCls = ({ isActive }) =>
    `rounded-full px-3 py-2 text-[15px] transition ${isActive ? 'font-semibold text-ink' : 'text-ink-500 hover:text-ink'}`

  const iconBtn = 'relative flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition hover:bg-sand-100'

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-ivory-50/90 backdrop-blur-md">
      <div className="container-x flex h-[68px] items-center gap-3 lg:h-[76px]">
        <button type="button" className={`${iconBtn} lg:hidden`} aria-label="Open menu" onClick={() => setMenu(true)}>
          <Menu className="h-5 w-5" />
        </button>
        <Logo />

        <nav aria-label="Main" className="ml-8 hidden flex-1 items-center justify-center gap-1 lg:flex">
          {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>{n.label}</NavLink>)}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
          <SearchBox compact className="hidden w-52 xl:block" />
          <button type="button" className={`${iconBtn} xl:hidden`} aria-label="Search books" onClick={() => setSearch(true)}>
            <Search className="h-5 w-5" />
          </button>
          <Link to="/wishlist" className={`${iconBtn} hidden sm:flex`} aria-label={`Wishlist, ${wishlist.length} saved`}>
            <Heart className="h-5 w-5" /><Badge n={wishlist.length} />
          </Link>
          <Link to="/cart" className={iconBtn} aria-label={`Shopping cart, ${cartCount} items`}>
            <ShoppingBag className="h-5 w-5" /><Badge n={cartCount} />
          </Link>

          <div ref={profRef} className="relative">
            <button
              type="button"
              onClick={() => setProfile((p) => !p)}
              aria-haspopup="menu"
              aria-expanded={profile}
              aria-label="Demo profile menu"
              className="flex items-center gap-1 rounded-full py-1 pl-1 pr-1.5 transition hover:bg-sand-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-600 text-xs font-bold text-white">{initials(name)}</span>
              <ChevronDown className={`hidden h-4 w-4 text-ink-500 transition sm:block ${profile ? 'rotate-180' : ''}`} />
            </button>
            {profile && (
              <div role="menu" className="absolute right-0 top-full mt-2 w-64 animate-fadeIn overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-sand-200">
                <div className="border-b border-sand-200 px-4 py-3">
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-ink-500">Demo profile, saved only in this browser</p>
                </div>
                {[
                  { to: '/orders', icon: Package, label: 'My orders' },
                  { to: '/wishlist', icon: Heart, label: 'Wishlist' },
                  { to: '/manage', icon: Settings, label: 'Store management (demo)' },
                ].map((i) => (
                  <button key={i.to} role="menuitem" type="button" onClick={() => navigate(i.to)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-sand-100">
                    <i.icon className="h-4 w-4 text-ink-500" /> {i.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={search} onClose={() => setSearch(false)} title="Search" variant="top" size="md" hideHeader bodyClassName="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-2xl font-semibold">Search the shelves</p>
          <button type="button" onClick={() => setSearch(false)} aria-label="Close search" className="rounded-full p-2 hover:bg-sand-100"><X className="h-5 w-5" /></button>
        </div>
        <SearchBox autoFocus onDone={() => setSearch(false)} />
        <p className="mt-3 text-xs text-ink-500">Try a title, an author or a topic such as &ldquo;money&rdquo; or &ldquo;habits&rdquo;.</p>
      </Modal>

      <Modal open={menu} onClose={() => setMenu(false)} title="Menu" variant="drawer" hideHeader bodyClassName="flex flex-col">
        <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4">
          <Logo />
          <button type="button" onClick={() => setMenu(false)} aria-label="Close menu" className="rounded-full p-2 hover:bg-sand-100"><X className="h-5 w-5" /></button>
        </div>
        <nav aria-label="Mobile" className="flex flex-col p-3">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `rounded-xl px-4 py-3 text-lg transition ${isActive ? 'bg-sand-100 font-semibold' : 'text-ink-700 hover:bg-sand-100'}`}>
              {n.label}
            </NavLink>
          ))}
          <NavLink to="/cart" className="rounded-xl px-4 py-3 text-lg text-ink-700 hover:bg-sand-100">Cart ({cartCount})</NavLink>
          <NavLink to="/manage" className="rounded-xl px-4 py-3 text-lg text-ink-700 hover:bg-sand-100">Store management (demo)</NavLink>
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-sand-200 p-5 text-sm text-ink-500">
          <User className="h-4 w-4" /> Signed in as demo profile
        </div>
      </Modal>
    </header>
  )
}
