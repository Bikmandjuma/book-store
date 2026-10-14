import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function Section({ title, subtitle, to, linkLabel = 'See all', children, className = '', id }) {
  return (
    <section id={id} className={`py-10 sm:py-14 ${className}`}>
      <div className="container-x">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <h2 className="font-display text-3xl font-medium text-ink-700 sm:text-4xl">{title}</h2>
            {subtitle && <p className="mt-1 max-w-xl text-[15px] text-ink-500">{subtitle}</p>}
          </div>
          {to && (
            <Link to={to} className="link-underline inline-flex shrink-0 items-center gap-1 text-sm font-medium text-ink-700">
              {linkLabel} <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  )
}
