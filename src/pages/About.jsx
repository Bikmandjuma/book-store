import { Link } from 'react-router-dom'
import { BookOpen, Heart, Truck, Users } from 'lucide-react'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { useStore } from '../context/StoreContext'

export default function About() {
  useDocumentTitle('About')
  const { books, settings } = useStore()
  const points = [
    { icon: BookOpen, title: 'Chosen, not dumped', text: 'Every title is picked by a reader. If we would not lend it to a friend, it does not go on the shelf.' },
    { icon: Heart, title: 'Honest descriptions', text: 'Clear summaries and real reasons to read, so you know what you are getting before you buy.' },
    { icon: Truck, title: 'Careful delivery', text: 'Books are wrapped like gifts and sent quickly. Delivery times and fees are shown before you order.' },
    { icon: Users, title: 'A community of readers', text: 'Leave a review, build a wishlist and tell us what to stock next.' },
  ]
  return (
    <div className="container-x py-10 sm:py-16">
      <div className="grid items-end gap-8 lg:grid-cols-2">
        <h1 className="font-display text-6xl font-medium leading-[0.95] text-ink-700 sm:text-7xl">A bookshop that<br />comes to you.</h1>
        <p className="max-w-lg text-[17px] leading-relaxed text-ink-500">
          {settings.storeName} is an independent bookstore concept: a calm, well-lit place to find the next book you will not stop talking about. This site is a working prototype that shows how {books.length} sample titles could be browsed, ordered and managed online.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {points.map((p) => (
          <div key={p.title} className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand-200/80">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sand-100 text-gold-700"><p.icon className="h-5 w-5" /></span>
            <h2 className="mt-4 font-display text-3xl font-semibold">{p.title}</h2>
            <p className="mt-1 text-[15px] leading-relaxed text-ink-500">{p.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-[2rem] bg-sand-100 p-8 sm:p-10">
        <h2 className="font-display text-4xl font-semibold">About this demo</h2>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-ink-700">
          Everything you do here is saved in your browser only: your cart, wishlist, demo orders, reviews and any changes made in the store management area. Real customer accounts, secure administration, shared inventory, payments, email and order fulfilment need a backend, which would be the next step if you decide to go live.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/shop" className="btn btn-primary">Browse the shelves</Link>
          <Link to="/manage" className="btn btn-outline">Try the management demo</Link>
        </div>
      </div>
    </div>
  )
}
