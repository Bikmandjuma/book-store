const STYLES = {
  Pending: 'bg-amber-50 text-amber-900 ring-amber-200',
  Confirmed: 'bg-sky-50 text-sky-900 ring-sky-200',
  Preparing: 'bg-violet-50 text-violet-900 ring-violet-200',
  Shipped: 'bg-indigo-50 text-indigo-900 ring-indigo-200',
  Delivered: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
  Cancelled: 'bg-red-50 text-red-900 ring-red-200',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STYLES[status] || STYLES.Pending}`}>
      {status}
    </span>
  )
}
