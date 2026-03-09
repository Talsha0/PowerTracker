import { getSupabaseClient } from '@/lib/supabase/client'
import type {
  Workout,
  WorkoutWithUser,
  WorkoutExercise,
  ExerciseSet,
  DraftData,
  WorkoutDraft,
  CustomWorkoutType,
} from '@/types/database'
import { calculateCalories } from '@/utils/calories'

const supabase = () => getSupabaseClient()

// ── Workouts ──────────────────────────────────────────────────────────────────

export async function getUserWorkouts(userId: string): Promise<Workout[]> {
  const { data, error } = await supabase()
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getFriendsWorkouts(userId: string): Promise<WorkoutWithUser[]> {
  // Get accepted friend IDs
  const { data: friendships } = await supabase()
    .from('friendships')
    .select('friend_id, user_id')
    .eq('status', 'accepted')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)

  if (!friendships?.length) return []

  const friendIds = friendships.map(f =>
    f.user_id === userId ? f.friend_id : f.user_id
  )

  const { data, error } = await supabase()
    .from('workouts')
    .select('*, users(id, username, avatar_url)')
    .in('user_id', friendIds)
    .eq('visibility', 'friends')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return (data ?? []) as WorkoutWithUser[]
}

export async function getWorkoutById(id: string): Promise<Workout | null> {
  const { data, error } = await supabase()
    .from('workouts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createWorkout(
  userId: string,
  payload: Omit<Workout, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Workout> {
  // Auto-calculate calories if not provided
  if (!payload.calories_burned && payload.duration_minutes) {
    payload.calories_burned = calculateCalories({
      type: payload.type,
      durationMinutes: payload.duration_minutes,
      distanceKm: payload.distance_km,
      intensityLevel: payload.intensity_level ?? undefined,
    })
  }

  const { data, error } = await supabase()
    .from('workouts')
    .insert({ ...payload, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateWorkout(
  id: string,
  payload: Partial<Omit<Workout, 'id' | 'user_id' | 'created_at'>>
): Promise<Workout> {
  const { data, error } = await supabase()
    .from('workouts')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await supabase().from('workouts').delete().eq('id', id)
  if (error) throw error
}

// ── Exercises ─────────────────────────────────────────────────────────────────

export async function getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
  const { data, error } = await supabase()
    .from('workout_exercises')
    .select('*, exercise_library(*), exercise_sets(*)')
    .eq('workout_id', workoutId)
    .order('exercise_order')

  if (error) throw error
  return (data ?? []) as WorkoutExercise[]
}

export async function addExerciseToWorkout(
  workoutId: string,
  exerciseId: string,
  order: number
): Promise<WorkoutExercise> {
  const { data, error } = await supabase()
    .from('workout_exercises')
    .insert({ workout_id: workoutId, exercise_id: exerciseId, exercise_order: order })
    .select('*, exercise_library(*), exercise_sets(*)')
    .single()

  if (error) throw error
  return data as WorkoutExercise
}

export async function removeExerciseFromWorkout(workoutExerciseId: string): Promise<void> {
  const { error } = await supabase()
    .from('workout_exercises')
    .delete()
    .eq('id', workoutExerciseId)
  if (error) throw error
}

// ── Sets ─────────────────────────────────────────────────────────────────────

export async function addSet(
  workoutExerciseId: string,
  setNumber: number,
  weight: number,
  repetitions: number
): Promise<ExerciseSet> {
  const { data, error } = await supabase()
    .from('exercise_sets')
    .insert({ workout_exercise_id: workoutExerciseId, set_number: setNumber, weight, repetitions })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSet(
  setId: string,
  payload: Partial<Pick<ExerciseSet, 'weight' | 'repetitions'>>
): Promise<ExerciseSet> {
  const { data, error } = await supabase()
    .from('exercise_sets')
    .update(payload)
    .eq('id', setId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSet(setId: string): Promise<void> {
  const { error } = await supabase().from('exercise_sets').delete().eq('id', setId)
  if (error) throw error
}

// ── Drafts ────────────────────────────────────────────────────────────────────

export async function getDraft(userId: string): Promise<WorkoutDraft | null> {
  const { data } = await supabase()
    .from('workout_drafts')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data ?? null
}

export async function saveDraft(userId: string, draftData: DraftData): Promise<void> {
  await supabase()
    .from('workout_drafts')
    .upsert(
      { user_id: userId, draft_data: draftData, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
}

export async function deleteDraft(userId: string): Promise<void> {
  await supabase().from('workout_drafts').delete().eq('user_id', userId)
}

// ── Custom workout types ───────────────────────────────────────────────────────

export async function getCustomWorkoutTypes(userId: string): Promise<CustomWorkoutType[]> {
  const { data } = await supabase()
    .from('custom_workout_types')
    .select('*')
    .eq('user_id', userId)
  return data ?? []
}

export async function createCustomWorkoutType(
  userId: string,
  name: string
): Promise<CustomWorkoutType> {
  const { data, error } = await supabase()
    .from('custom_workout_types')
    .insert({ user_id: userId, name })
    .select()
    .single()
  if (error) throw error
  return data
}
