'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Flame, MapPin, Clock, Trash2, Edit2, MessageCircle, Lock, Users,
  Dumbbell, TrendingUp
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getWorkoutById, deleteWorkout, updateWorkout, getWorkoutExercises } from '@/services/workout.service'
import { TEXT } from '@/constants/text'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { CommentSection } from '@/components/social/CommentSection'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatPace, calculatePace, formatDuration } from '@/utils/pace'

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const { data: workout, isLoading } = useQuery({
    queryKey: ['workout', id],
    queryFn: () => getWorkoutById(id),
  })

  const { data: exercises = [] } = useQuery({
    queryKey: ['workout-exercises', id],
    queryFn: () => getWorkoutExercises(id),
    enabled: workout?.type === 'gym',
  })

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: () => deleteWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      router.push('/dashboard')
    },
  })

  const { mutate: toggleVisibility } = useMutation({
    mutationFn: () =>
      updateWorkout(id, {
        visibility: workout?.visibility === 'private' ? 'friends' : 'private',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workout', id] }),
  })

  if (isLoading) return <PageLoader />
  if (!workout) return null

  const isOwner = user?.id === workout.user_id
  const typeLabel = TEXT.workout.types[workout.type]
  const pace = workout.type === 'running' && workout.distance_km && workout.duration_minutes
    ? calculatePace(workout.distance_km, workout.duration_minutes)
    : null

  return (
    <div className="page-container">
      <Header
        title={typeLabel}
        showBack
        rightAction={
          isOwner ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/workout/${id}/edit`)}
              className="p-2"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-4 mt-4">
        {/* Main stats */}
        <Card>
          <div className="text-right mb-4">
            <p className="text-xs text-gray-500">
              {new Date(workout.created_at).toLocaleDateString('he-IL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {workout.duration_minutes && (
              <div className="text-right bg-surface-elevated rounded-xl p-3">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-xl font-bold text-white">{formatDuration(workout.duration_minutes)}</p>
                <p className="text-xs text-gray-500">{TEXT.workout.duration.split(' ')[0]}</p>
              </div>
            )}

            {workout.distance_km && (
              <div className="text-right bg-surface-elevated rounded-xl p-3">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-xl font-bold text-white">{workout.distance_km.toFixed(2)} ק"מ</p>
                <p className="text-xs text-gray-500">{TEXT.workout.distance.split(' ')[0]}</p>
              </div>
            )}

            {workout.calories_burned && (
              <div className="text-right bg-surface-elevated rounded-xl p-3">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-xl font-bold text-orange-400">{workout.calories_burned}</p>
                <p className="text-xs text-gray-500">קלוריות</p>
              </div>
            )}

            {pace && (
              <div className="text-right bg-surface-elevated rounded-xl p-3">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-xl font-bold text-green-400">{formatPace(pace)}</p>
                <p className="text-xs text-gray-500">דק׳/ק"מ</p>
              </div>
            )}

            {workout.intensity_level && (
              <div className="text-right bg-surface-elevated rounded-xl p-3">
                <p className="text-xl font-bold text-purple-400">
                  {'★'.repeat(workout.intensity_level)}
                </p>
                <p className="text-xs text-gray-500">{TEXT.workout.intensity}</p>
              </div>
            )}
          </div>

          {workout.notes && (
            <div className="mt-4 p-3 bg-surface-elevated rounded-xl text-right">
              <p className="text-sm text-gray-300">{workout.notes}</p>
            </div>
          )}
        </Card>

        {/* Gym exercises */}
        {workout.type === 'gym' && exercises.length > 0 && (
          <Card>
            <h3 className="font-bold text-white text-right mb-4">{TEXT.exercises.title}</h3>
            <div className="space-y-4">
              {exercises.map((ex) => (
                <div key={ex.id}>
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <h4 className="font-semibold text-white">{ex.exercise_library?.name}</h4>
                    <Dumbbell className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="space-y-1.5">
                    {(ex.exercise_sets ?? []).map((set, idx) => (
                      <div key={set.id} className="flex items-center justify-between text-sm text-gray-300 bg-surface-elevated rounded-lg px-3 py-2">
                        <span>{set.weight * set.repetitions} ק"ג נפח</span>
                        <span>{set.weight} ק"ג × {set.repetitions}</span>
                        <span className="text-gray-500">סט {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        {isOwner && (
          <Card>
            <div className="flex gap-3">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4" />
                {TEXT.workout.delete}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toggleVisibility()}
                className="flex-1"
              >
                {workout.visibility === 'private' ? (
                  <><Lock className="w-4 h-4" />{TEXT.workout.visibility.private}</>
                ) : (
                  <><Users className="w-4 h-4" />{TEXT.workout.visibility.friends}</>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Comments */}
        {user && (
          <Card>
            <div
              className="flex items-center justify-between mb-3 cursor-pointer"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-white">{TEXT.social.comments}</h3>
            </div>
            {showComments && (
              <CommentSection workoutId={id} userId={user.id} />
            )}
          </Card>
        )}
      </div>

      {/* Delete confirm modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={TEXT.workout.delete}
      >
        <p className="text-gray-300 text-right mb-6">{TEXT.workout.deleteConfirm}</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)} className="flex-1">
            {TEXT.app.cancel}
          </Button>
          <Button variant="danger" onClick={() => remove()} loading={deleting} className="flex-1">
            {TEXT.workout.delete}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
