import useDocumentTitle from '../hooks/useDocumentTitle'
import { useStore } from '../context/StoreContext'

export default function Policies() {
  useDocumentTitle('Store policies')
  const { money, settings } = useStore()
  const blocks = [
    { id: 'shipping', title: 'Shipping & delivery', body: [`Orders over ${money(settings.freeDeliveryThreshold)} ship free. Otherwise a flat delivery fee of ${money(settings.deliveryFee)} applies.`, 'Delivery estimates shown on book pages are illustrative for this demo.'] },
    { id: 'returns', title: 'Returns & refunds', body: ['Sample policy: unused books can be returned within 14 days of delivery.', 'In this demo no payments are taken, so there is nothing to refund.'] },
    { id: 'privacy', title: 'Privacy', body: ['This demo stores your cart, wishlist, reviews and demo orders in your own browser using LocalStorage. Nothing is sent to a server.', 'Clear your browser data or use the reset option in store management to remove it.'] },
    { id: 'terms', title: 'Terms of use', body: ['This site is a demonstration prototype. Sample books, prices, ratings, reviews, testimonials and order statuses are not real offers.', 'Replace this text with your real terms before launching a live store.'] },
  ]
  return (
    <div className="container-x max-w-3xl py-10 sm:py-16">
      <h1 className="font-display text-6xl font-medium text-ink-700">Store policies</h1>
      <p className="mt-2 text-sm text-ink-500">Placeholder text for the demo. Review and replace before going live.</p>
      <div className="mt-8 space-y-6">
        {blocks.map((b) => (
          <section key={b.id} id={b.id} className="scroll-mt-28 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-sand-200/80">
            <h2 className="font-display text-3xl font-semibold">{b.title}</h2>
            {b.body.map((p) => <p key={p} className="mt-2 text-[15px] leading-relaxed text-ink-700">{p}</p>)}
          </section>
        ))}
      </div>
    </div>
  )
}
