// Small, defensive LocalStorage wrapper.
// Every value is stored as { v: <schema version>, data, t: <timestamp> } under a "booksta_" key.

const PREFIX = 'booksta_'
const VERSION = 1
let available = null

function probe() {
  try {
    const k = `${PREFIX}__probe`
    window.localStorage.setItem(k, '1')
    window.localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

export function isAvailable() {
  if (available === null) available = typeof window !== 'undefined' && probe()
  return available
}

/** Returns { found, invalid, value }. Never throws. */
export function read(key) {
  if (!isAvailable()) return { found: false, invalid: false }
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    if (raw === null) return { found: false, invalid: false }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || parsed.v !== VERSION || !('data' in parsed)) {
      return { found: true, invalid: true }
    }
    return { found: true, invalid: false, value: parsed.data }
  } catch {
    return { found: true, invalid: true }
  }
}

/** Returns true when the value was really persisted. */
export function write(key, data) {
  if (!isAvailable()) return false
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify({ v: VERSION, data, t: Date.now() }))
    return true
  } catch (err) {
    console.warn(`[booksta] Could not save "${key}"`, err)
    return false
  }
}

export function remove(key) {
  try { window.localStorage.removeItem(PREFIX + key) } catch { /* ignore */ }
}

export const storage = { isAvailable, read, write, remove }
export default storage
