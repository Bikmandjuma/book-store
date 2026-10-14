import { Feather, Briefcase, Cpu, Compass, GraduationCap, User, Landmark, Baby } from 'lucide-react'

export const CATEGORY_ICONS = {
  feather: Feather,
  briefcase: Briefcase,
  cpu: Cpu,
  compass: Compass,
  graduation: GraduationCap,
  user: User,
  landmark: Landmark,
  baby: Baby,
}
export const iconFor = (name) => CATEGORY_ICONS[name] || Compass
