'use client'

import { Download, X } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { Button } from '@/components/ui/Button'
import { TEXT } from '@/constants/text'

export function InstallPrompt() {
  const { isInstallable, install, dismiss } = useInstallPrompt()

  if (!isInstallable) return null

  return (
    <div className="fixed bottom-20 inset-x-4 z-50 animate-slide-up">
      <div className="bg-brand-900 border border-brand-500/50 rounded-2xl p-4 shadow-2xl flex items-center gap-3">
        <div className="flex-1 text-right">
          <p className="font-semibold text-white text-sm">{TEXT.pwa.installTitle}</p>
          <p className="text-xs text-brand-300 mt-0.5">{TEXT.pwa.installMessage}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={dismiss} className="p-2">
            <X className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={install} className="gap-1.5">
            <Download className="w-4 h-4" />
            {TEXT.pwa.installButton}
          </Button>
        </div>
      </div>
    </div>
  )
}
