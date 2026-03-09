'use client'

import { Brain, AlertTriangle, CheckCircle2, TrendingUp, Droplets } from 'lucide-react'
import type { Workout } from '@/types/database'
import type { CoachRecommendation } from '@/utils/aiCoach'
import { generateCoachRecommendations } from '@/utils/aiCoach'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TEXT } from '@/constants/text'

interface CoachWidgetProps {
  workouts: Workout[]
  streak: number
}

const icons: Record<CoachRecommendation['type'], typeof Brain> = {
  rest: AlertTriangle,
  overtraining: AlertTriangle,
  consistency: CheckCircle2,
  progressive_overload: TrendingUp,
  general: Droplets,
}

const priorityBadge: Record<CoachRecommendation['priority'], { variant: 'danger' | 'warning' | 'default'; label: string }> = {
  high: { variant: 'danger', label: 'חשוב' },
  medium: { variant: 'warning', label: 'מומלץ' },
  low: { variant: 'default', label: 'טיפ' },
}

export function CoachWidget({ workouts, streak }: CoachWidgetProps) {
  const recommendations = generateCoachRecommendations(workouts, streak)

  return (
    <Card>
      <div className="flex items-center justify-end gap-2 mb-3">
        <h3 className="font-bold text-white">{TEXT.aiCoach.title}</h3>
        <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center">
          <Brain className="w-5 h-5 text-brand-400" />
        </div>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-gray-500 text-sm text-right">{TEXT.aiCoach.noRecommendations}</p>
      ) : (
        <div className="space-y-3">
          {recommendations.slice(0, 3).map((rec, i) => {
            const Icon = icons[rec.type]
            const badge = priorityBadge[rec.priority]

            return (
              <div
                key={i}
                className="flex items-start gap-3 bg-surface-elevated rounded-xl p-3"
              >
                <div className="flex flex-col items-end flex-1 gap-1">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <p className="text-sm text-gray-200 text-right">{rec.message}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  rec.priority === 'high' ? 'bg-red-500/20' :
                  rec.priority === 'medium' ? 'bg-yellow-500/20' :
                  'bg-brand-500/20'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    rec.priority === 'high' ? 'text-red-400' :
                    rec.priority === 'medium' ? 'text-yellow-400' :
                    'text-brand-400'
                  }`} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
