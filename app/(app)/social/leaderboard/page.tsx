'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trophy, Medal } from 'lucide-react'
import Image from 'next/image'
import { UserCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getLeaderboard } from '@/services/social.service'
import { TEXT } from '@/constants/text'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/LoadingSpinner'

type Metric = 'workouts' | 'distance'

export default function LeaderboardPage() {
  const { user, isLoading } = useAuth()
  const [metric, setMetric] = useState<Metric>('workouts')

  const { data: entries = [] } = useQuery({
    queryKey: ['leaderboard', user?.id, metric],
    queryFn: () => getLeaderboard(user!.id, metric),
    enabled: !!user,
  })

  if (isLoading) return <PageLoader />

  const medals = ['🥇', '🥈', '🥉']
  const metricLabel = metric === 'workouts' ? 'אימונים' : 'ק"מ'

  return (
    <div className="page-container">
      <Header title={TEXT.social.leaderboards.title} showBack />

      {/* Metric selector */}
      <div className="flex gap-2 mb-5">
        {[
          { id: 'workouts' as Metric, label: TEXT.social.leaderboards.mostWorkouts },
          { id: 'distance' as Metric, label: TEXT.social.leaderboards.mostDistance },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setMetric(opt.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              metric === opt.id
                ? 'bg-brand-500 text-white'
                : 'bg-surface-card text-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-500 text-right mb-3">{TEXT.social.leaderboards.thisWeek}</div>

      <div className="space-y-2">
        {entries.map((entry) => {
          const isCurrentUser = entry.user.id === user?.id
          return (
            <Card
              key={entry.user.id}
              className={`flex items-center gap-3 ${
                isCurrentUser ? 'border-brand-500/50 bg-brand-500/10' : ''
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center text-xl font-bold">
                {entry.rank <= 3 ? medals[entry.rank - 1] : (
                  <span className="text-gray-500 text-sm">#{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              {entry.user.avatar_url ? (
                <Image
                  src={entry.user.avatar_url}
                  alt={entry.user.username}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                  <UserCircle2 className="w-6 h-6 text-gray-500" />
                </div>
              )}

              {/* Name */}
              <div className="flex-1 text-right">
                <p className={`font-semibold ${isCurrentUser ? 'text-brand-400' : 'text-white'}`}>
                  {entry.user.username}
                  {isCurrentUser && ' (אתה)'}
                </p>
              </div>

              {/* Value */}
              <div className="text-right">
                <p className="text-lg font-bold text-white">
                  {metric === 'distance' ? entry.value.toFixed(1) : entry.value}
                </p>
                <p className="text-xs text-gray-500">{metricLabel}</p>
              </div>
            </Card>
          )
        })}

        {entries.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">אין נתונים להצגה</p>
            <p className="text-gray-500 text-sm mt-1">הוסף חברים לראות את לוח המובילים</p>
          </div>
        )}
      </div>
    </div>
  )
}
