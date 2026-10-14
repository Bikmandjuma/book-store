import { Link } from 'react-router-dom'

export default function EmptyState({ icon: Icon, title, text, actionLabel, to, onAction, secondary }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-dashed border-sand-300 bg-white/60 px-6 py-14 text-center">
      {Icon && (
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sand-100 text-gold-700">
          <Icon className="h-7 w-7" />
        </span>
      )}
      <h2 className="font-display text-3xl font-semibold">{title}</h2>
      {text && <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{text}</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {actionLabel && (to
          ? <Link to={to} className="btn btn-primary">{actionLabel}</Link>
          : <button type="button" onClick={onAction} className="btn btn-primary">{actionLabel}</button>)}
        {secondary}
      </div>
    </div>
  )
}
