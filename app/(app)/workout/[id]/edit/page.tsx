'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getWorkoutById, updateWorkout } from '@/services/workout.service'
import { TEXT } from '@/constants/text'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import type { IntensityLevel, WorkoutVisibility } from '@/types/database'

export default function EditWorkoutPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: workout, isLoading } = useQuery({
    queryKey: ['workout', id],
    queryFn: () => getWorkoutById(id),
  })

  const [distanceKm, setDistanceKm] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [intensityLevel, setIntensityLevel] = useState<IntensityLevel | ''>('')
  const [notes, setNotes] = useState('')
  const [visibility, setVisibility] = useState<WorkoutVisibility>('private')

  useEffect(() => {
    if (workout) {
      setDistanceKm(workout.distance_km?.toString() ?? '')
      setDurationMinutes(workout.duration_minutes?.toString() ?? '')
      setIntensityLevel((workout.intensity_level as IntensityLevel) ?? '')
      setNotes(workout.notes ?? '')
      setVisibility(workout.visibility)
    }
  }, [workout])

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      updateWorkout(id, {
        distance_km: distanceKm ? parseFloat(distanceKm) : null,
        duration_minutes: durationMinutes ? parseFloat(durationMinutes) : null,
        intensity_level: intensityLevel || null,
        notes: notes || null,
        visibility,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout', id] })
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      router.push(`/workout/${id}`)
    },
  })

  if (isLoading) return <PageLoader />
  if (!workout || user?.id !== workout.user_id) {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="page-container">
      <Header title={TEXT.workout.edit} showBack />

      <div className="space-y-4 mt-4">
        <Card className="space-y-4">
          {(workout.type === 'running' || workout.type === 'walking') && (
            <Input
              type="number"
              label={TEXT.workout.distance}
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              inputMode="decimal"
              min="0"
              step="0.1"
              suffix='ק"מ'
            />
          )}
          <Input
            type="number"
            label={TEXT.workout.duration}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            inputMode="numeric"
            min="0"
            suffix="דק׳"
          />
          {workout.type === 'gym' && (
            <div>
              <p className="text-sm font-medium text-gray-300 mb-2 text-right">{TEXT.workout.intensity}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setIntensityLevel(level as IntensityLevel)}
                    className={`intensity-btn ${
                      intensityLevel === level ? 'intensity-btn-active' : 'intensity-btn-inactive'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <Select
            label={TEXT.workout.visibility.title}
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as WorkoutVisibility)}
            options={[
              { value: 'private', label: TEXT.workout.visibility.private },
              { value: 'friends', label: TEXT.workout.visibility.friends },
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 text-right">
              {TEXT.workout.notes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={TEXT.workout.notesPlaceholder}
              rows={3}
              className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-white text-right text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
              dir="rtl"
            />
          </div>
        </Card>

        <Button fullWidth size="lg" onClick={() => save()} loading={isPending}>
          <Save className="w-5 h-5" />
          {TEXT.app.save}
        </Button>
      </div>
    </div>
  )
}
