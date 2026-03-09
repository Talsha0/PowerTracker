import { cn } from '@/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full border-2 border-surface-elevated border-t-brand-500 animate-spin',
          sizes[size]
        )}
      />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  )
}

export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <LoadingSpinner size="lg" label={label} />
    </div>
  )
}
