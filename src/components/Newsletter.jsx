import { useState } from 'react'
import { Mail, ArrowRight } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { isEmail } from '../utils/validation'

export default function Newsletter() {
  const { subscribe } = useStore()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!email.trim()) return setError('Enter your email address.')
    if (!isEmail(email)) return setError('Enter a valid email address, like name@example.com.')
    setError('')
    if (subscribe(email)) { setDone(true); setEmail('') }
  }

  return (
    <section className="py-10 sm:py-14">
      <div className="container-x">
        <div className="grid items-center gap-8 rounded-[2rem] bg-charcoal px-6 py-10 text-ivory-50 sm:px-12 sm:py-14 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-medium leading-tight sm:text-5xl">Get one good book recommendation a week.</h2>
            <p className="mt-3 max-w-md text-[15px] text-ivory-50/70">New arrivals, staff picks and the occasional offer. No spam. This is a demo form, so nothing is actually sent.</p>
          </div>
          {done ? (
            <div role="status" className="rounded-2xl bg-white/10 p-6">
              <p className="font-display text-2xl font-semibold">You are on the list.</p>
              <p className="mt-1 text-sm text-ivory-50/75">Saved in this browser only. Welcome code to try in your cart: <b>WELCOME10</b></p>
              <button type="button" onClick={() => setDone(false)} className="mt-4 text-sm underline underline-offset-4">Subscribe another email</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <label htmlFor="nl-email" className="sr-only">Email address</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="nl-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    aria-invalid={!!error} aria-describedby={error ? 'nl-err' : undefined}
                    className="w-full rounded-full border-0 bg-white py-3.5 pl-11 pr-4 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <button type="submit" className="btn btn-primary !py-3.5">Subscribe <ArrowRight className="h-4 w-4" /></button>
              </div>
              {error && <p id="nl-err" role="alert" className="mt-2 text-sm font-medium text-red-300">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
