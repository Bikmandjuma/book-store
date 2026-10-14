import { Compass } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <div className="container-x py-20">
      <EmptyState icon={Compass} title="This page is off the map" text="The address may be mistyped or the page may have moved. Head back to the shelves and keep browsing." actionLabel="Browse books" to="/shop" />
    </div>
  )
}
