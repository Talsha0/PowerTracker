'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Plus, Save, Dumbbell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useWorkoutStore } from '@/store/workoutStore'
import {
  createWorkout,
  getDraft,
  deleteDraft,
  getCustomWorkoutTypes,
  createCustomWorkoutType,
  addExerciseToWorkout,
  addSet as addSetToDb,
} from '@/services/workout.service'
import { TEXT } from '@/constants/text'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { AutoSaveIndicator } from '@/components/workout/AutoSaveIndicator'
import { ExerciseForm } from '@/components/workout/ExerciseForm'
import { ExercisePicker } from '@/components/workout/ExercisePicker'
import { calculateCalories } from '@/utils/calories'
import { calculatePace, formatPace } from '@/utils/pace'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import type { WorkoutType, IntensityLevel, DraftExercise, DraftSet } from '@/types/database'

const WORKOUT_TYPES: Array<{ value: WorkoutType; label: string; emoji: string }> = [
  { value: 'running', label: TEXT.workout.types.running, emoji: '🏃' },
  { value: 'walking', label: TEXT.workout.types.walking, emoji: '🚶' },
  { value: 'gym', label: TEXT.workout.types.gym, emoji: '💪' },
]

const GYM_CATEGORIES = [
  { value: 'legs', label: TEXT.workout.categories.legs },
  { value: 'chest_back', label: TEXT.workout.categories.chest_back },
  { value: 'arms_shoulders', label: TEXT.workout.categories.arms_shoulders },
  { value: 'push', label: TEXT.workout.categories.push },
  { value: 'pull', label: TEXT.workout.categories.pull },
]

export default function NewWorkoutPageWrapper() {
  return (
    <Suspense fallback={<PageLoader label={TEXT.app.loading} />}>
      <NewWorkoutPage />
    </Suspense>
  )
}

function NewWorkoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const isResume = searchParams.get('resume') === 'true'

  const {
    draft,
    setDraft,
    updateDraft,
    addExercise,
    updateExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    clearDraft,
  } = useWorkoutStore()

  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)

  const { data: customTypes = [] } = useQuery({
    queryKey: ['customWorkoutTypes', user?.id],
    queryFn: () => getCustomWorkoutTypes(user!.id),
    enabled: !!user,
  })

  // Init draft
  useEffect(() => {
    if (isResume && user) {
      getDraft(user.id).then((serverDraft) => {
        if (serverDraft) {
          setDraft(serverDraft.draft_data)
        } else if (!draft) {
          setDraft({ type: 'running', startedAt: new Date().toISOString() })
        }
      })
    } else if (!draft) {
      setDraft({ type: 'running', startedAt: new Date().toISOString() })
    }
  }, [isResume, user]) // eslint-disable-line

  const handleAutoSave = useCallback(() => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date())
    }, 500)
  }, [])

  useAutoSave(user?.id, draft, handleAutoSave)

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('לא מחובר')
      if (!draft) throw new Error('אין נתוני אימון')

      const calories = calculateCalories({
        type: draft.type,
        durationMinutes: draft.duration_minutes ?? 0,
        distanceKm: draft.distance_km,
        intensityLevel: draft.intensity_level,
      })

      const workout = await createWorkout(user.id, {
        type: draft.type,
        distance_km: draft.distance_km ?? null,
        duration_minutes: draft.duration_minutes ?? null,
        intensity_level: draft.intensity_level ?? null,
        calories_burned: calories,
        visibility: 'private',
        notes: draft.notes ?? null,
        gym_category: draft.gym_category ?? null,
      })

      // Save exercises and sets for gym workouts
      if (draft.type === 'gym' && draft.exercises?.length) {
        for (let i = 0; i < draft.exercises.length; i++) {
          const draftEx = draft.exercises[i]
          if (!draftEx.exerciseId) continue

          const workoutExercise = await addExerciseToWorkout(workout.id, draftEx.exerciseId, i + 1)

          for (let j = 0; j < draftEx.sets.length; j++) {
            const s = draftEx.sets[j]
            await addSetToDb(workoutExercise.id, j + 1, s.weight, s.repetitions)
          }
        }
      }

      await deleteDraft(user.id)
      clearDraft()
      return workout
    },
    onSuccess: (workout) => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['draft'] })
      router.push(`/workout/${workout.id}`)
    },
    onError: (err) => {
      alert(`שגיאה בשמירת האימון: ${err instanceof Error ? err.message : 'נסה שוב'}`)
    },
  })

  const handleAddExercise = (exercise: any) => {
    const newExercise: DraftExercise = {
      tempId: `ex-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [{ tempId: `set-${Date.now()}`, weight: 0, repetitions: 10 }],
    }
    addExercise(newExercise)
  }

  const handleAddCustomCategory = async () => {
    if (!user || !newCategory.trim()) return
    const custom = await createCustomWorkoutType(user.id, newCategory.trim())
    updateDraft({ gym_category: custom.name })
    setNewCategory('')
    setShowNewCategory(false)
    queryClient.invalidateQueries({ queryKey: ['customWorkoutTypes'] })
  }

  const pace = draft?.type === 'running' && draft.distance_km && draft.duration_minutes
    ? calculatePace(draft.distance_km, draft.duration_minutes)
    : null

  const estimatedCalories = draft?.duration_minutes
    ? calculateCalories({
        type: draft?.type ?? 'running',
        durationMinutes: draft.duration_minutes,
        distanceKm: draft.distance_km,
        intensityLevel: draft.intensity_level,
      })
    : 0

  const gymCategories = [
    ...GYM_CATEGORIES,
    ...customTypes.map((t) => ({ value: t.name, label: t.name })),
  ]

  if (!draft) return null

  return (
    <div className="page-container">
      <Header
        title={TEXT.workout.new}
        showBack
        rightAction={
          <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
        }
      />

      <div className="space-y-5 mt-4">
        {/* Workout type selector */}
        <div>
          <p className="section-title">{TEXT.workout.chooseType}</p>
          <div className="grid grid-cols-3 gap-3">
            {WORKOUT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => updateDraft({ type: t.value, exercises: [], gym_category: undefined })}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                  draft.type === t.value
                    ? 'border-brand-500 bg-brand-500/20 text-white'
                    : 'border-surface-border text-gray-500 hover:border-gray-500'
                }`}
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-xs font-semibold">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Running / Walking fields */}
        {(draft.type === 'running' || draft.type === 'walking') && (
          <Card className="space-y-4">
            <Input
              type="number"
              label={TEXT.workout.distance}
              value={draft.distance_km ?? ''}
              onChange={(e) => updateDraft({ distance_km: parseFloat(e.target.value) || undefined })}
              inputMode="decimal"
              min="0"
              step="0.1"
              suffix='ק"מ'
            />
            <Input
              type="number"
              label={TEXT.workout.duration}
              value={draft.duration_minutes ?? ''}
              onChange={(e) => updateDraft({ duration_minutes: parseFloat(e.target.value) || undefined })}
              inputMode="numeric"
              min="0"
              suffix="דק׳"
            />
            {pace && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-400 font-semibold">{formatPace(pace)} דק׳/ק"מ</span>
                <span className="text-gray-400">{TEXT.workout.pace}</span>
              </div>
            )}
          </Card>
        )}

        {/* Gym fields */}
        {draft.type === 'gym' && (
          <Card className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-300 mb-2 text-right">{TEXT.workout.gymCategory}</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {gymCategories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => updateDraft({ gym_category: cat.value })}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all text-right ${
                      draft.gym_category === cat.value
                        ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                        : 'border-surface-border text-gray-400'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {showNewCategory ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddCustomCategory}>הוסף</Button>
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder={TEXT.workout.customCategoryName}
                    autoFocus
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewCategory(true)}
                  className="w-full border border-dashed border-surface-border"
                >
                  <Plus className="w-4 h-4" />
                  {TEXT.workout.addCustomCategory}
                </Button>
              )}
            </div>

            <Input
              type="number"
              label={TEXT.workout.duration}
              value={draft.duration_minutes ?? ''}
              onChange={(e) => updateDraft({ duration_minutes: parseFloat(e.target.value) || undefined })}
              inputMode="numeric"
              min="0"
              suffix="דק׳"
            />

            {/* Intensity */}
            <div>
              <p className="text-sm font-medium text-gray-300 mb-2 text-right">{TEXT.workout.intensity}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => updateDraft({ intensity_level: level as IntensityLevel })}
                    className={`intensity-btn ${
                      draft.intensity_level === level ? 'intensity-btn-active' : 'intensity-btn-inactive'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              {draft.intensity_level && (
                <p className="text-xs text-gray-500 text-right mt-1">
                  {TEXT.workout.intensityLevels[draft.intensity_level - 1]}
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Estimated calories */}
        {estimatedCalories > 0 && (
          <div className="flex items-center justify-between text-sm px-1">
            <span className="text-orange-400 font-semibold">~{estimatedCalories} קל׳</span>
            <span className="text-gray-400">{TEXT.workout.calories}</span>
          </div>
        )}

        {/* Exercises (gym only) */}
        {draft.type === 'gym' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExercisePicker(true)}
              >
                <Plus className="w-4 h-4" />
                {TEXT.exercises.add}
              </Button>
              <h3 className="section-title mb-0">{TEXT.exercises.title}</h3>
            </div>

            {(!draft.exercises || draft.exercises.length === 0) ? (
              <Card className="text-center py-8 border-dashed">
                <Dumbbell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">{TEXT.exercises.noExercises}</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {draft.exercises.map((ex, idx) => (
                  <ExerciseForm
                    key={ex.tempId}
                    exercise={ex}
                    index={idx}
                    onUpdate={updateExercise}
                    onRemove={removeExercise}
                    onAddSet={addSet}
                    onUpdateSet={updateSet}
                    onRemoveSet={removeSet}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5 text-right">
            {TEXT.workout.notes}
          </label>
          <textarea
            value={draft.notes ?? ''}
            onChange={(e) => updateDraft({ notes: e.target.value })}
            placeholder={TEXT.workout.notesPlaceholder}
            rows={3}
            className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-3 text-white text-right text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
            dir="rtl"
          />
        </div>

        {/* Save button */}
        <Button
          fullWidth
          size="lg"
          onClick={() => save()}
          loading={saving}
          className="mb-4"
        >
          <Save className="w-5 h-5" />
          {TEXT.workout.save}
        </Button>
      </div>

      {/* Exercise picker modal */}
      {user && (
        <ExercisePicker
          userId={user.id}
          open={showExercisePicker}
          onClose={() => setShowExercisePicker(false)}
          onSelect={handleAddExercise}
        />
      )}
    </div>
  )
}
