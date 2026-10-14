import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import { useStore } from '../context/StoreContext'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname, hash])
  return null
}

export default function Layout() {
  const { storageOk } = useStore()
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div className="bg-charcoal px-4 py-2 text-center text-[13px] text-ivory-50/90">
        Demo storefront: books, prices, reviews and orders are sample content for presentation only.
      </div>
      {!storageOk && (
        <div role="alert" className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-center text-[13px] font-medium text-amber-900">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Browser storage is unavailable, so changes will be lost when you close or refresh this tab.
        </div>
      )}
      <Header />
      <ScrollManager />
      <main id="main" className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  )
}
