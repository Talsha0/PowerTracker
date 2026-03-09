'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('SW registered:', registration.scope)

          // Listen for sync messages
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'SYNC_REQUESTED') {
              // Trigger client-side sync
              window.dispatchEvent(new CustomEvent('sw-sync'))
            }
          })
        })
        .catch((err) => console.log('SW registration failed:', err))
    }
  }, [])

  return null
}
