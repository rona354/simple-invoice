import { HomeIcon, DocumentIcon, CogIcon } from './icons'

export const navigation = [
  { nameKey: 'nav.dashboard', href: '/dashboard', icon: HomeIcon },
  { nameKey: 'nav.invoices', href: '/invoices/new', icon: DocumentIcon },
  { nameKey: 'nav.settings', href: '/settings', icon: CogIcon },
] as const
