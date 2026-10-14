import { useState } from 'react'
import { Eye } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { useConfirm } from '../../context/ConfirmContext'
import Modal from '../../components/Modal'
import OrderDetails from '../../components/OrderDetails'
import StatusBadge from '../../components/StatusBadge'
import { ORDER_STATUSES } from '../../config'
import { formatDate, formatMoney } from '../../utils/format'

export default function OrdersAdmin() {
  const { orders, setOrderStatus } = useStore()
  const confirm = useConfirm()
  const [openRef, setOpenRef] = useState(null)
  const [filter, setFilter] = useState('')
  const selected = orders.find((o) => o.ref === openRef)
  const list = filter ? orders.filter((o) => o.status === filter) : orders

  const change = async (o, status) => {
    if (status === 'Cancelled') {
      const ok = await confirm({ title: 'Cancel this demo order?', message: `Order ${o.ref} will be cancelled and its books returned to stock. Cancelled orders cannot be changed afterwards.`, confirmLabel: 'Cancel order', cancelLabel: 'Keep order', tone: 'danger' })
      if (!ok) return
    }
    setOrderStatus(o.ref, status)
  }

  if (!orders.length) return <p className="rounded-2xl border border-dashed border-sand-300 p-10 text-center text-sm text-ink-500">No demo orders yet. Place one from the shop and it will appear here, where you can move it through each status.</p>

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="ord-filter" className="text-sm text-ink-500">Status</label>
        <select id="ord-filter" className="input !w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All orders</option>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <p className="text-sm text-ink-500" role="status">{list.length} {list.length === 1 ? 'order' : 'orders'}. Statuses are simulated.</p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-3xl bg-white shadow-soft ring-1 ring-sand-200/80">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-sand-200 bg-sand-100/60 text-xs text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Order</th>
              <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
              <th scope="col" className="px-4 py-3 font-semibold">Total (demo)</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {list.map((o) => (
              <tr key={o.ref}>
                <td className="px-4 py-3"><span className="block font-mono font-bold">{o.ref}</span><span className="text-xs text-ink-500">{formatDate(o.createdAt)}</span></td>
                <td className="px-4 py-3"><span className="block font-medium">{o.customer.name}</span><span className="text-xs text-ink-500">{o.customer.email}</span></td>
                <td className="px-4 py-3 font-semibold">{formatMoney(o.totals.total, o.currency)}</td>
                <td className="px-4 py-3">
                  {o.status === 'Cancelled' ? <StatusBadge status="Cancelled" /> : (
                    <>
                      <label htmlFor={`st-${o.ref}`} className="sr-only">Status for {o.ref}</label>
                      <select id={`st-${o.ref}`} className="input !w-auto !rounded-full !py-1.5" value={o.status} onChange={(e) => change(o, e.target.value)}>
                        {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </>
                  )}
                </td>
                <td className="px-4 py-3 text-right"><button type="button" className="btn btn-outline btn-sm" onClick={() => setOpenRef(o.ref)}><Eye className="h-4 w-4" /> View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!selected} onClose={() => setOpenRef(null)} title="Order details" size="lg">{selected && <OrderDetails order={selected} />}</Modal>
    </div>
  )
}
