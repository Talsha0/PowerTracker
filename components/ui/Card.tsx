import { type HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
  elevated?: boolean
  glass?: boolean
}

export function Card({ className, padded = true, elevated, glass, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-surface-border',
        glass
          ? 'bg-white/5 backdrop-blur-sm'
          : elevated
            ? 'bg-surface-elevated'
            : 'bg-surface-card',
        padded && 'p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
