import { WifiOff } from 'lucide-react'
import { TEXT } from '@/constants/text'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-surface-card rounded-3xl flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{TEXT.pwa.offlineTitle}</h1>
        <p className="text-gray-400 max-w-xs mx-auto">{TEXT.pwa.offlineMessage}</p>
      </div>
    </div>
  )
}
