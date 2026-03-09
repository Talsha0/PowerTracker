'use client'

import { useEffect, useRef, useCallback } from 'react'
import { saveDraft } from '@/services/workout.service'
import type { DraftData } from '@/types/database'

const AUTOSAVE_INTERVAL_MS = 15_000 // 15 seconds

export function useAutoSave(
  userId: string | undefined,
  draft: DraftData | null,
  onSaved?: () => void
) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSavedRef = useRef<string>('')

  const save = useCallback(async () => {
    if (!userId || !draft) return
    const serialized = JSON.stringify(draft)
    if (serialized === lastSavedRef.current) return // No changes

    try {
      await saveDraft(userId, draft)
      lastSavedRef.current = serialized
      onSaved?.()
    } catch {
      // Silent fail — local state is still intact
    }
  }, [userId, draft, onSaved])

  // Periodic autosave
  useEffect(() => {
    timerRef.current = setInterval(save, AUTOSAVE_INTERVAL_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [save])

  // Save on visibility change (tab hide / app backgrounded)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        save()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [save])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => save()
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [save])

  return { saveNow: save }
}
