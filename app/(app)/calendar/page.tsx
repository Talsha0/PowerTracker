'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { getUserWorkouts } from '@/services/workout.service'
import { TEXT } from '@/constants/text'
import { Header } from '@/components/layout/Header'
import { WorkoutCalendar } from '@/components/calendar/WorkoutCalendar'
import { PageLoader } from '@/components/ui/LoadingSpinner'

export default function CalendarPage() {
  const { user, isLoading } = useAuth()

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts', user?.id],
    queryFn: () => getUserWorkouts(user!.id),
    enabled: !!user,
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="page-container">
      <Header title={TEXT.calendar.title} showBack />
      <div className="mt-4">
        <WorkoutCalendar workouts={workouts} />
      </div>
    </div>
  )
}
