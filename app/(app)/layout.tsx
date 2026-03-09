import type { ReactNode } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface" dir="rtl">
      <main className="max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
      <InstallPrompt />
    </div>
  )
}
