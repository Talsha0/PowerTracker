'use client'

import { useEffect, useState } from 'react'
import { openDB } from 'idb'

const DB_NAME = 'powertracker-offline'
const STORE_NAME = 'pending-actions'

export interface PendingAction {
  id: string
  type: string
  payload: unknown
  timestamp: number
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncPendingActions()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getDB = async () => {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      },
    })
  }

  const queueAction = async (type: string, payload: unknown) => {
    try {
      const db = await getDB()
      const action: PendingAction = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        payload,
        timestamp: Date.now(),
      }
      await db.add(STORE_NAME, action)
      const count = await db.count(STORE_NAME)
      setPendingCount(count)
    } catch {
      // IndexedDB not available
    }
  }

  const syncPendingActions = async () => {
    try {
      const db = await getDB()
      const actions = await db.getAll(STORE_NAME)
      // Process actions in order — extend this for real sync logic
      for (const action of actions) {
        try {
          await processAction(action)
          await db.delete(STORE_NAME, action.id)
        } catch {
          // Keep failed actions for retry
        }
      }
      const count = await db.count(STORE_NAME)
      setPendingCount(count)
    } catch {
      // IndexedDB not available
    }
  }

  const processAction = async (action: PendingAction) => {
    // Placeholder — wire up actual service calls here
    console.log('Syncing action:', action.type)
  }

  return { isOnline, pendingCount, queueAction, syncPendingActions }
}
