'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trophy, Calendar } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { getDraft } from '@/services/workout.service'
import { getUserAnalytics } from '@/services/analytics.service'
import { TEXT } from '@/constants/text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { WorkoutCard, WorkoutCardSkeleton } from '@/components/workout/WorkoutCard'
import { StreakWidget } from '@/components/analytics/StreakWidget'
import { CoachWidget } from '@/components/ai/CoachWidget'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageLoader } from '@/components/ui/LoadingSpinner'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const { weeklyGoals } = useAuthStore()
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'בוקר טוב' : h < 17 ? 'צהריים טובים' : 'ערב טוב')
  }, [])

  const { data: analytics, isLoading: workoutsLoading, error: analyticsError } = useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: () => getUserAnalytics(user!.id),
    enabled: !!user,
  })

  const { data: draft } = useQuery({
    queryKey: ['draft', user?.id],
    queryFn: () => getDraft(user!.id),
    enabled: !!user,
  })

  if (isLoading) return <PageLoader label={TEXT.app.loading} />
  if (analyticsError) return (
    <div className="page-container pt-8 text-right">
      <p className="text-red-400 font-bold mb-2">שגיאה בטעינת נתונים</p>
      <p className="text-gray-400 text-sm break-all">{String(analyticsError)}</p>
    </div>
  )

  const weeklyWorkoutProgress = weeklyGoals.workoutsPerWeek
    ? Math.min(100, ((analytics?.weeklyWorkouts ?? 0) / weeklyGoals.workoutsPerWeek) * 100)
    : null

  return (
    <div className="page-container">
      {/* Greeting */}
      <div className="flex items-center justify-between py-4">
        <Link href="/calendar" className="p-2 rounded-xl hover:bg-surface-card transition-colors">
          <Calendar className="w-5 h-5 text-gray-400" />
        </Link>
        <div className="text-right">
          <p className="text-gray-400 text-sm" suppressHydrationWarning>{greeting},</p>
          <h2 className="text-xl font-bold text-white" suppressHydrationWarning>{user?.username}</h2>
        </div>
      </div>

      {/* Draft Banner */}
      {draft && (
        <Link href="/workout/new?resume=true">
          <div className="mb-4 bg-brand-500/20 border border-brand-500/40 rounded-2xl p-4 flex items-center justify-between animate-slide-down">
            <Button variant="primary" size="sm">
              {TEXT.workout.draftResume}
            </Button>
            <div className="text-right">
              <p className="text-sm font-semibold text-brand-300">{TEXT.workout.draftFound}</p>
              <p className="text-xs text-gray-400">
                {new Date(draft.draft_data.startedAt).toLocaleDateString('he-IL')}
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="text-center p-3">
          <p className="text-2xl font-black text-brand-400">{analytics?.totalWorkouts ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">{TEXT.dashboard.totalWorkouts}</p>
        </Card>
        <Card className="text-center p-3">
          <p className="text-2xl font-black text-green-400">
            {analytics?.totalDistanceKm?.toFixed(0) ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">{TEXT.analytics.km}</p>
        </Card>
        <Card className="text-center p-3">
          <p className="text-2xl font-black text-orange-400">{analytics?.weeklyWorkouts ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">{TEXT.dashboard.thisWeek}</p>
        </Card>
      </div>

      {/* Streak */}
      <div className="mb-4">
        <StreakWidget streak={analytics?.streak ?? 0} />
      </div>

      {/* Weekly Goals Progress */}
      {weeklyGoals.workoutsPerWeek && weeklyWorkoutProgress !== null && (
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <p className="font-semibold text-white">{TEXT.dashboard.weeklyGoals}</p>
          </div>
          <ProgressBar
            value={weeklyWorkoutProgress}
            color={weeklyWorkoutProgress >= 100 ? 'green' : 'brand'}
            label={`${analytics?.weeklyWorkouts ?? 0} / ${weeklyGoals.workoutsPerWeek} אימונים`}
            showValue
          />
        </Card>
      )}

      {/* AI Coach */}
      <div className="mb-4">
        <CoachWidget workouts={analytics?.recentWorkouts ?? []} streak={analytics?.streak ?? 0} />
      </div>

      {/* Recent Workouts */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <Link href="/analytics" className="text-brand-400 text-sm font-medium">
            הצג הכל
          </Link>
          <h3 className="section-title mb-0">{TEXT.dashboard.recentWorkouts}</h3>
        </div>

        {workoutsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <WorkoutCardSkeleton key={i} />)}
          </div>
        ) : !analytics?.recentWorkouts?.length ? (
          <Card className="text-center py-10">
            <p className="text-4xl mb-3">🏋️</p>
            <p className="text-gray-400 mb-4">{TEXT.dashboard.noWorkouts}</p>
            <Link href="/workout/new">
              <Button>{TEXT.dashboard.startWorkout}</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {(analytics?.recentWorkouts ?? []).slice(0, 5).map((w) => (
              <WorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
