'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, BarChart2, Users, User } from 'lucide-react'
import { cn } from '@/utils/cn'
import { TEXT } from '@/constants/text'

const navItems = [
  { href: '/profile', icon: User, label: TEXT.nav.profile },
  { href: '/social', icon: Users, label: TEXT.nav.social },
  { href: '/workout/new', icon: Plus, label: TEXT.nav.workout, isAction: true },
  { href: '/analytics', icon: BarChart2, label: TEXT.nav.analytics },
  { href: '/dashboard', icon: Home, label: TEXT.nav.dashboard },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-surface-card/95 backdrop-blur-md border-t border-surface-border z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-2 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && !item.isAction)

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center shadow-xl shadow-brand-500/30 active:scale-95 transition-transform">
                  <item.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-touch px-2 py-1 rounded-xl transition-colors',
                isActive ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <item.icon
                className={cn('w-5 h-5 transition-all', isActive && 'scale-110')}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
