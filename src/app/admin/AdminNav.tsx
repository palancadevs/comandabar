'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/admin',
    label: 'Resumen',
    match: (pathname: string) => pathname === '/admin',
  },
  {
    href: '/admin/tables',
    label: 'Mesas',
    match: (pathname: string) => pathname.startsWith('/admin/tables'),
  },
  {
    href: '/admin/menu/items',
    label: 'Carta',
    match: (pathname: string) => pathname.startsWith('/admin/menu'),
  },
  {
    href: '/admin/kds',
    label: 'Cocina',
    match: (pathname: string) => pathname.startsWith('/admin/kds'),
  },
  {
    href: '/admin/settings',
    label: 'Ajustes',
    match: (pathname: string) => pathname.startsWith('/admin/settings'),
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {navItems.map((item) => {
        const isActive = item.match(pathname)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'shrink-0 rounded-full border-2 border-[var(--brand-black)] px-4 py-2 text-sm font-bold transition-colors',
              isActive
                ? 'bg-[var(--brand-black)] text-[var(--brand-cream)]'
                : 'bg-[var(--brand-cream)] text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
