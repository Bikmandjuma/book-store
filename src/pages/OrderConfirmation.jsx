import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Copy, PackageSearch } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useToast } from '../context/ToastContext'
import useDocumentTitle from '../hooks/useDocumentTitle'
import OrderDetails from '../components/OrderDetails'
import EmptyState from '../components/EmptyState'
import { copyText } from '../utils/clipboard'

export default function OrderConfirmation() {
  const { ref } = useParams()
  const { orders } = useStore()
  const toast = useToast()
  const order = orders.find((o) => o.ref === ref)
  useDocumentTitle(order ? `Order ${order.ref}` : 'Order not found')

  if (!order) {
    return (
      <div className="container-x py-16">
        <EmptyState icon={PackageSearch} title="We could not find that order" text="Demo orders live in the browser where they were placed. Check My Orders for everything saved here." actionLabel="Go to My Orders" to="/orders" />
      </div>
    )
  }

  const copy = async () => { (await copyText(order.ref)) ? toast.success('Order reference copied.') : toast.error('Could not copy the reference.') }

  return (
    <div className="container-x max-w-3xl py-10 sm:py-14">
      <div className="rounded-[2rem] bg-white p-6 text-center shadow-soft ring-1 ring-sand-200/80 sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-9 w-9" /></span>
        <h1 className="mt-5 font-display text-5xl font-semibold leading-tight">Demo order saved</h1>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-ink-500">Thank you, {order.customer.name.split(' ')[0]}. Your order is stored in this browser. No payment was taken and nothing was sent to a real store.</p>
        <button type="button" onClick={copy} className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-sand-100 px-5 py-2.5 font-mono text-sm font-bold hover:bg-sand-200">{order.ref} <Copy className="h-4 w-4" /></button>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/orders" className="btn btn-dark">View My Orders</Link>
          <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
      <div className="mt-8"><OrderDetails order={order} /></div>
    </div>
  )
}
