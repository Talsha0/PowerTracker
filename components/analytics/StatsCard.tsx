import { type ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

interface StatsCardProps {
  label: string
  value: string | number
  unit?: string
  icon?: ReactNode
  color?: 'brand' | 'green' | 'orange' | 'purple'
  className?: string
}

export function StatsCard({ label, value, unit, icon, color = 'brand', className }: StatsCardProps) {
  const colors = {
    brand: 'text-brand-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
  }

  return (
    <Card className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        {icon && <div className={cn('text-xl', colors[color])}>{icon}</div>}
        <p className="text-xs text-gray-500 text-right flex-1">{label}</p>
      </div>
      <div className="flex items-baseline gap-1 justify-end">
        {unit && <span className="text-xs text-gray-400">{unit}</span>}
        <span className={cn('text-2xl font-bold', colors[color])}>{value}</span>
      </div>
    </Card>
  )
}
