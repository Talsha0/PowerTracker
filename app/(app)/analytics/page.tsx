'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trophy, MapPin, Zap, Dumbbell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getUserAnalytics, getPersonalRecords, getRunningTrend, getWeeklyWorkoutCounts } from '@/services/analytics.service'
import { TEXT } from '@/constants/text'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { StatsCard } from '@/components/analytics/StatsCard'
import { StreakWidget } from '@/components/analytics/StreakWidget'
import { WorkoutChart } from '@/components/analytics/WorkoutChart'
import { formatPace, formatDuration } from '@/utils/pace'
import { PageLoader } from '@/components/ui/LoadingSpinner'

type Tab = 'overview' | 'running' | 'gym'

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const { data: analytics } = useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: () => getUserAnalytics(user!.id),
    enabled: !!user,
  })

  const { data: records } = useQuery({
    queryKey: ['records', user?.id],
    queryFn: () => getPersonalRecords(user!.id),
    enabled: !!user,
  })

  const { data: runTrend = [] } = useQuery({
    queryKey: ['run-trend', user?.id],
    queryFn: () => getRunningTrend(user!.id, 30),
    enabled: !!user && activeTab !== 'gym',
  })

  const { data: weeklyData = [] } = useQuery({
    queryKey: ['weekly-counts', user?.id],
    queryFn: () => getWeeklyWorkoutCounts(user!.id),
    enabled: !!user,
  })

  if (isLoading) return <PageLoader />

  const tabs = [
    { id: 'overview' as Tab, label: TEXT.analytics.overview },
    { id: 'running' as Tab, label: TEXT.analytics.running },
    { id: 'gym' as Tab, label: TEXT.analytics.gym },
  ]

  return (
    <div className="page-container">
      <Header title={TEXT.analytics.title} />

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card rounded-xl p-1 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <StreakWidget streak={analytics?.streak ?? 0} />

            <div className="grid grid-cols-2 gap-3">
              <StatsCard
                label={TEXT.analytics.totalWorkouts}
                value={analytics?.totalWorkouts ?? 0}
                color="brand"
              />
              <StatsCard
                label={TEXT.analytics.totalDistance}
                value={(analytics?.totalDistanceKm ?? 0).toFixed(1)}
                unit={TEXT.analytics.km}
                color="green"
              />
              <StatsCard
                label="זמן כולל"
                value={formatDuration(analytics?.totalDurationMinutes ?? 0)}
                color="orange"
              />
              <StatsCard
                label={TEXT.dashboard.thisWeek}
                value={analytics?.weeklyWorkouts ?? 0}
                color="purple"
              />
            </div>

            {/* Weekly frequency chart */}
            {weeklyData.length > 0 && (
              <Card>
                <h3 className="font-bold text-white text-right mb-4">{TEXT.analytics.workoutFrequency}</h3>
                <WorkoutChart
                  data={weeklyData}
                  type="bar"
                  dataKey="count"
                  xKey="week"
                  color="#0ea5e9"
                />
              </Card>
            )}

            {/* Workouts by type */}
            {analytics && (
              <Card>
                <h3 className="font-bold text-white text-right mb-4">{TEXT.analytics.workoutsByType}</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.workoutsByType).map(([type, count]) => {
                    const total = analytics.totalWorkouts || 1
                    const pct = (count / total) * 100
                    return (
                      <div key={type} className="flex items-center gap-3 text-right">
                        <div className="flex-1 bg-surface-elevated rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              type === 'running' ? 'bg-green-500' :
                              type === 'walking' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 w-28">
                          <span className="text-white font-semibold text-sm">{count}</span>
                          <span className="text-gray-400 text-sm">
                            {TEXT.workout.types[type as keyof typeof TEXT.workout.types]}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
          </>
        )}

        {/* Running Tab */}
        {activeTab === 'running' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {records?.longestRun && (
                <StatsCard
                  label={TEXT.analytics.longestRun}
                  value={records.longestRun.toFixed(1)}
                  unit={TEXT.analytics.km}
                  icon={<MapPin />}
                  color="green"
                />
              )}
              {records?.fastestPace && (
                <StatsCard
                  label={TEXT.analytics.fastestPace}
                  value={formatPace(records.fastestPace)}
                  unit={'דק׳/ק"מ'}
                  icon={<Zap />}
                  color="brand"
                />
              )}
            </div>

            {runTrend.length > 0 && (
              <>
                <Card>
                  <h3 className="font-bold text-white text-right mb-4">{TEXT.analytics.paceProgress}</h3>
                  <WorkoutChart
                    data={runTrend}
                    type="line"
                    dataKey="pace"
                    xKey="date"
                    color="#22c55e"
                    unit={'דק׳/ק"מ'}
                  />
                </Card>

                <Card>
                  <h3 className="font-bold text-white text-right mb-4">מרחק לאימון</h3>
                  <WorkoutChart
                    data={runTrend}
                    type="area"
                    dataKey="distance"
                    xKey="date"
                    color="#0ea5e9"
                    unit='ק"מ'
                  />
                </Card>
              </>
            )}
          </>
        )}

        {/* Gym Tab */}
        {activeTab === 'gym' && (
          <>
            {records && Object.keys(records.heaviestWeights).length > 0 ? (
              <Card>
                <div className="flex items-center justify-end gap-2 mb-4">
                  <h3 className="font-bold text-white">{TEXT.analytics.personalRecords}</h3>
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="space-y-3">
                  {Object.entries(records.heaviestWeights)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([exercise, weight]) => (
                      <div
                        key={exercise}
                        className="flex items-center justify-between text-right bg-surface-elevated rounded-xl px-3 py-2.5"
                      >
                        <span className="text-purple-400 font-bold text-sm">{weight} ק"ג</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm">{exercise}</span>
                          <Dumbbell className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            ) : (
              <Card className="text-center py-10">
                <Dumbbell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">אין נתוני חדר כושר עדיין</p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
