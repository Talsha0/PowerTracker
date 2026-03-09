'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2, Cloud } from 'lucide-react'
import { cn } from '@/utils/cn'
import { TEXT } from '@/constants/text'

interface AutoSaveIndicatorProps {
  isSaving: boolean
  lastSaved?: Date | null
}

export function AutoSaveIndicator({ isSaving, lastSaved }: AutoSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (!isSaving && lastSaved) {
      setShowSaved(true)
      const t = setTimeout(() => setShowSaved(false), 2000)
      return () => clearTimeout(t)
    }
  }, [isSaving, lastSaved])

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs transition-opacity duration-300',
        (isSaving || showSaved) ? 'opacity-100' : 'opacity-0'
      )}
    >
      {isSaving ? (
        <>
          <Loader2 className="w-3 h-3 text-brand-400 animate-spin" />
          <span className="text-brand-400">{TEXT.workout.saving}</span>
        </>
      ) : showSaved ? (
        <>
          <Check className="w-3 h-3 text-green-400" />
          <span className="text-green-400">{TEXT.workout.autoSave}</span>
        </>
      ) : (
        <>
          <Cloud className="w-3 h-3 text-gray-500" />
          <span className="text-gray-500">{TEXT.workout.draft}</span>
        </>
      )}
    </div>
  )
}
