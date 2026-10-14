import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useToast } from '../context/ToastContext'
import { Logo } from './Header'

export default function Footer() {
  const { settings, categories } = useStore()
  const toast = useToast()
  const social = [
    { icon: Instagram, label: 'Instagram' }, { icon: Facebook, label: 'Facebook' },
    { icon: Twitter, label: 'X (Twitter)' }, { icon: Youtube, label: 'YouTube' },
  ]
  const col = 'space-y-2.5 text-sm text-ivory-50/75'
  const lnk = 'transition hover:text-white hover:underline underline-offset-4'

  return (
    <footer className="mt-10 bg-charcoal text-ivory-50">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory-50/70">
            An independent bookshop experience, online. Hand-picked titles, honest prices and quick delivery.
          </p>
          <div className="mt-5 flex gap-2">
            {social.map((s) => (
              <button
                key={s.label} type="button" aria-label={`${s.label} (placeholder)`}
                onClick={() => toast.info(`${s.label} link is a placeholder in this demo.`)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-gold-600"
              >
                <s.icon className="h-[18px] w-[18px]" />
              </button>
            ))}
          </div>
        </div>

        <nav aria-label="Shop links">
          <h2 className="mb-4 font-sans text-sm font-bold tracking-wide text-white">Shop</h2>
          <ul className={col}>
            <li><Link className={lnk} to="/shop">All books</Link></li>
            <li><Link className={lnk} to="/shop?sort=popular">Bestsellers</Link></li>
            <li><Link className={lnk} to="/shop?sort=newest">New arrivals</Link></li>
            <li><Link className={lnk} to="/shop?sale=1">On offer</Link></li>
            {categories.slice(0, 3).map((c) => <li key={c.id}><Link className={lnk} to={`/shop?category=${c.id}`}>{c.name}</Link></li>)}
          </ul>
        </nav>

        <nav aria-label="Help and policies">
          <h2 className="mb-4 font-sans text-sm font-bold tracking-wide text-white">Help &amp; policies</h2>
          <ul className={col}>
            <li><Link className={lnk} to="/orders">My orders</Link></li>
            <li><Link className={lnk} to="/wishlist">Wishlist</Link></li>
            <li><Link className={lnk} to="/policies#shipping">Shipping &amp; delivery</Link></li>
            <li><Link className={lnk} to="/policies#returns">Returns &amp; refunds</Link></li>
            <li><Link className={lnk} to="/policies#privacy">Privacy</Link></li>
            <li><Link className={lnk} to="/policies#terms">Terms of use</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 font-sans text-sm font-bold tracking-wide text-white">Contact (placeholders)</h2>
          <ul className={col}>
            <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0" /> {settings.contactEmail}</li>
            <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0" /> {settings.contactPhone}</li>
            <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {settings.address}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-ivory-50/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Booksta.store. Demonstration storefront with sample content.</p>
          <p>
            Prices, ratings and orders are illustrative. <Link to="/manage" className="underline underline-offset-4 hover:text-white">Store management demo</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
