import { getSupabaseClient } from '@/lib/supabase/client'
import type { Workout, Analytics, PersonalRecord } from '@/types/database'
import { calculatePace } from '@/utils/pace'

const supabase = () => getSupabaseClient()

export async function getUserAnalytics(userId: string): Promise<Analytics> {
  const { data: workouts } = await supabase()
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const all = workouts ?? []

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weeklyWorkouts = all.filter(w => new Date(w.created_at) >= weekAgo).length

  // Calculate streak
  const streak = calculateStreak(all)

  const totalDistanceKm = all.reduce((s, w) => s + (w.distance_km ?? 0), 0)
  const totalDurationMinutes = all.reduce((s, w) => s + (w.duration_minutes ?? 0), 0)

  const workoutsByType = all.reduce((acc, w) => {
    acc[w.type as keyof typeof acc] = (acc[w.type as keyof typeof acc] ?? 0) + 1
    return acc
  }, { running: 0, walking: 0, gym: 0 })

  return {
    totalWorkouts: all.length,
    totalDistanceKm,
    totalDurationMinutes,
    workoutsByType,
    recentWorkouts: all.slice(0, 10),
    streak,
    weeklyWorkouts,
  }
}

export function calculateStreak(workouts: Workout[]): number {
  if (!workouts.length) return 0

  const days = new Set(
    workouts.map(w => new Date(w.created_at).toDateString())
  )

  let streak = 0
  const today = new Date()

  for (let i = 0; i <= 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (days.has(d.toDateString())) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  return streak
}

export async function getPersonalRecords(userId: string): Promise<PersonalRecord> {
  const { data: workouts } = await supabase()
    .from('workouts')
    .select('*')
    .eq('user_id', userId)

  const all = workouts ?? []
  const runs = all.filter(w => w.type === 'running')

  const longestRun = runs.reduce((max, w) => Math.max(max, w.distance_km ?? 0), 0)

  const paces = runs
    .filter(w => w.distance_km && w.duration_minutes)
    .map(w => calculatePace(w.distance_km!, w.duration_minutes!))
    .filter(Boolean) as number[]
  const fastestPace = paces.length ? Math.min(...paces) : undefined

  // Get heaviest weight per exercise
  const { data: exerciseSets } = await supabase()
    .from('exercise_sets')
    .select('weight, workout_exercises(exercise_id, exercise_library(name))')
    .order('weight', { ascending: false })

  const heaviestWeights: Record<string, number> = {}
  for (const set of exerciseSets ?? []) {
    const ex = (set as any).workout_exercises?.exercise_library
    if (ex?.name) {
      heaviestWeights[ex.name] = Math.max(heaviestWeights[ex.name] ?? 0, set.weight)
    }
  }

  return {
    longestRun: longestRun || undefined,
    fastestPace,
    heaviestWeights,
  }
}

export async function getRunningTrend(
  userId: string,
  days = 30
): Promise<Array<{ date: string; pace: number; distance: number }>> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data: workouts } = await supabase()
    .from('workouts')
    .select('created_at, distance_km, duration_minutes')
    .eq('user_id', userId)
    .eq('type', 'running')
    .gte('created_at', since.toISOString())
    .order('created_at')

  return (workouts ?? [])
    .filter(w => w.distance_km && w.duration_minutes)
    .map(w => ({
      date: new Date(w.created_at).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
      pace: calculatePace(w.distance_km!, w.duration_minutes!) ?? 0,
      distance: w.distance_km ?? 0,
    }))
}

export async function getWeeklyWorkoutCounts(
  userId: string,
  weeks = 8
): Promise<Array<{ week: string; count: number }>> {
  const since = new Date()
  since.setDate(since.getDate() - weeks * 7)

  const { data: workouts } = await supabase()
    .from('workouts')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())

  const weekMap = new Map<string, number>()

  for (const w of workouts ?? []) {
    const d = new Date(w.created_at)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })
    weekMap.set(key, (weekMap.get(key) ?? 0) + 1)
  }

  return Array.from(weekMap.entries()).map(([week, count]) => ({ week, count }))
}
