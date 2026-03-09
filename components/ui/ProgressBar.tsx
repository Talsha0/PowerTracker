import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value: number // 0–100
  className?: string
  color?: 'brand' | 'green' | 'yellow' | 'red' | 'accent'
  size?: 'sm' | 'md'
  label?: string
  showValue?: boolean
}

export function ProgressBar({
  value,
  className,
  color = 'brand',
  size = 'md',
  label,
  showValue,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))

  const colors = {
    brand: 'bg-brand-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    accent: 'bg-accent',
  }

  const heights = { sm: 'h-1.5', md: 'h-2.5' }

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-gray-400">{label}</span>}
          {showValue && <span className="text-xs font-medium text-gray-300">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-surface-elevated rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
