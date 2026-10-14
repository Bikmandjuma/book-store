import { hashString, initials } from '../utils/id'

const TONES = [
  'bg-[#E6D8BC] text-[#5A3E15]', 'bg-[#D9E0D0] text-[#2F4A3C]', 'bg-[#E4D3D3] text-[#6B2E2E]',
  'bg-[#D6DCE8] text-[#23324A]', 'bg-[#E9DDEB] text-[#4B2E4F]', 'bg-[#EEE3C6] text-[#7E5524]',
]

export default function AuthorAvatar({ name, className = 'h-12 w-12 text-sm' }) {
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full font-display text-lg font-bold shadow-soft ring-2 ring-white ${TONES[hashString(name) % TONES.length]} ${className}`}>
      {initials(name.replace(/&.*$/, ''))}
    </span>
  )
}
