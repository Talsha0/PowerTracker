'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import type { Workout } from '@/types/database'
import { TEXT } from '@/constants/text'
import { cn } from '@/utils/cn'

interface WorkoutCalendarProps {
  workouts: Workout[]
}

const typeColors = {
  running: 'bg-green-500',
  walking: 'bg-blue-500',
  gym: 'bg-purple-500',
}

export function WorkoutCalendar({ workouts }: WorkoutCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay() // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Map workouts to dates
  const workoutMap = new Map<string, Workout[]>()
  for (const w of workouts) {
    const d = new Date(w.created_at)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate().toString()
      workoutMap.set(key, [...(workoutMap.get(key) ?? []), w])
    }
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const today = new Date()
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year

  // Blank cells before first day (Sunday start)
  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="bg-surface-card rounded-2xl border border-surface-border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-surface-elevated transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        <h3 className="font-bold text-white text-lg">
          {TEXT.calendar.months[month]} {year}
        </h3>
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-surface-elevated transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {TEXT.calendar.days.map((d) => (
          <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const dayWorkouts = workoutMap.get(day.toString()) ?? []
          const hasWorkout = dayWorkouts.length > 0

          return (
            <div
              key={day}
              className={cn(
                'aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium relative',
                isToday(day) && 'ring-2 ring-brand-500',
                hasWorkout ? 'bg-brand-500/20 text-brand-300' : 'text-gray-500'
              )}
            >
              <span className={cn(isToday(day) && 'text-brand-400 font-bold')}>
                {day}
              </span>
              {hasWorkout && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayWorkouts.slice(0, 3).map((w, i) => (
                    <div
                      key={i}
                      className={cn('w-1 h-1 rounded-full', typeColors[w.type])}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 mt-4 pt-3 border-t border-surface-border">
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">
              {TEXT.workout.types[type as keyof typeof TEXT.workout.types]}
            </span>
            <div className={cn('w-2 h-2 rounded-full', color)} />
          </div>
        ))}
      </div>
    </div>
  )
}
