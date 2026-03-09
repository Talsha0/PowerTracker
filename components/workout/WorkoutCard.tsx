'use client'

import Link from 'next/link'
import { formatDistance } from 'date-fns'
import { he } from 'date-fns/locale'
import { Flame, MapPin, Clock, Dumbbell, ChevronLeft } from 'lucide-react'
import type { Workout } from '@/types/database'
import { TEXT } from '@/constants/text'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatPace, calculatePace, formatDuration } from '@/utils/pace'
import { cn } from '@/utils/cn'

interface WorkoutCardProps {
  workout: Workout
  showUser?: boolean
  username?: string
  className?: string
}

const typeColors = {
  running: 'bg-green-500/20 text-green-400',
  walking: 'bg-blue-500/20 text-blue-400',
  gym: 'bg-purple-500/20 text-purple-400',
}

const typeIcons = {
  running: '🏃',
  walking: '🚶',
  gym: '💪',
}

export function WorkoutCard({ workout, showUser, username, className }: WorkoutCardProps) {
  const typeLabel = TEXT.workout.types[workout.type]
  const pace = workout.type === 'running' && workout.distance_km && workout.duration_minutes
    ? calculatePace(workout.distance_km, workout.duration_minutes)
    : null

  return (
    <Link href={`/workout/${workout.id}`}>
      <Card
        className={cn(
          'flex flex-col gap-3 hover:border-brand-500/50 transition-colors active:scale-[0.98]',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <ChevronLeft className="w-4 h-4 text-gray-500" />
          <div className="flex items-center gap-2">
            {showUser && username && (
              <span className="text-sm text-gray-400">{username}</span>
            )}
            <span className="text-xl">{typeIcons[workout.type]}</span>
            <Badge className={typeColors[workout.type]}>{typeLabel}</Badge>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex justify-end gap-4">
          {workout.duration_minutes && (
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="text-sm">{formatDuration(workout.duration_minutes)}</span>
              <Clock className="w-4 h-4 text-gray-500" />
            </div>
          )}
          {workout.distance_km && (
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="text-sm">{workout.distance_km.toFixed(1)} ק"מ</span>
              <MapPin className="w-4 h-4 text-gray-500" />
            </div>
          )}
          {workout.calories_burned && (
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="text-sm">{workout.calories_burned}</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
          )}
          {workout.type === 'gym' && (
            <div className="flex items-center gap-1.5 text-gray-300">
              <Dumbbell className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>

        {/* Pace for running */}
        {pace && (
          <div className="text-right text-xs text-gray-500">
            {TEXT.workout.pace}: {formatPace(pace)} {TEXT.workout.paceUnit}
          </div>
        )}

        {/* Date */}
        <div className="text-right text-xs text-gray-500">
          {formatDistance(new Date(workout.created_at), new Date(), {
            addSuffix: true,
            locale: he,
          })}
        </div>
      </Card>
    </Link>
  )
}

// Skeleton loader
export function WorkoutCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="h-4 w-4 bg-surface-elevated rounded" />
          <div className="h-6 w-24 bg-surface-elevated rounded-full" />
        </div>
        <div className="flex justify-end gap-4">
          <div className="h-4 w-16 bg-surface-elevated rounded" />
          <div className="h-4 w-16 bg-surface-elevated rounded" />
        </div>
        <div className="h-3 w-24 bg-surface-elevated rounded self-end" />
      </div>
    </Card>
  )
}
