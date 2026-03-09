import { Flame } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { TEXT } from '@/constants/text'
import { cn } from '@/utils/cn'

interface StreakWidgetProps {
  streak: number
  longestStreak?: number
  className?: string
}

export function StreakWidget({ streak, longestStreak, className }: StreakWidgetProps) {
  const isHot = streak >= 7

  return (
    <Card className={cn('text-right', className)}>
      <div className="flex items-center justify-between">
        <div className={cn(
          'flex items-center gap-1 text-sm',
          isHot ? 'text-orange-400' : 'text-gray-500'
        )}>
          {longestStreak && (
            <span>{TEXT.analytics.longestStreak}: {longestStreak}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-gray-500">{TEXT.analytics.currentStreak}</p>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-sm text-gray-400">{TEXT.dashboard.days}</span>
              <span className={cn(
                'text-3xl font-bold',
                streak >= 14 ? 'text-red-400' :
                streak >= 7 ? 'text-orange-400' :
                streak >= 3 ? 'text-yellow-400' :
                'text-gray-300'
              )}>
                {streak}
              </span>
            </div>
          </div>
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center',
            streak >= 7 ? 'bg-orange-500/20' : 'bg-surface-elevated'
          )}>
            <Flame
              className={cn(
                'w-6 h-6',
                streak >= 14 ? 'text-red-400' :
                streak >= 7 ? 'text-orange-400' :
                streak >= 3 ? 'text-yellow-400' :
                'text-gray-500'
              )}
              fill={streak >= 3 ? 'currentColor' : 'none'}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
