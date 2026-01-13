import { HomeIcon, DocumentIcon, CogIcon } from './icons'

export const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Invoices', href: '/invoices/new', icon: DocumentIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
] as const
