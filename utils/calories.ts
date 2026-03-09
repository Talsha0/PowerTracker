import type { WorkoutType, IntensityLevel } from '@/types/database'

// MET values per activity
const MET_VALUES: Record<WorkoutType, number | Record<number, number>> = {
  running: 9.8,
  walking: 3.5,
  gym: {
    1: 3.0,
    2: 4.0,
    3: 5.0,
    4: 6.0,
    5: 8.0,
  },
}

// Average user weight in kg (used when user weight is unknown)
const DEFAULT_WEIGHT_KG = 75

export function calculateCalories({
  type,
  durationMinutes,
  distanceKm,
  intensityLevel,
  weightKg = DEFAULT_WEIGHT_KG,
}: {
  type: WorkoutType
  durationMinutes: number
  distanceKm?: number | null
  intensityLevel?: IntensityLevel | null
  weightKg?: number
}): number {
  let met: number

  if (type === 'gym') {
    const gymMets = MET_VALUES.gym as Record<number, number>
    met = gymMets[intensityLevel ?? 3]
  } else if (type === 'running' && distanceKm && durationMinutes) {
    // Speed-adjusted MET for running
    const speedKmh = (distanceKm / durationMinutes) * 60
    met = Math.max(4, Math.min(18, speedKmh * 1.0))
  } else {
    met = MET_VALUES[type] as number
  }

  // Calories = MET × weight(kg) × duration(hours)
  const durationHours = durationMinutes / 60
  return Math.round(met * weightKg * durationHours)
}

export function estimateCaloriesRunning(distanceKm: number, durationMinutes: number): number {
  return calculateCalories({ type: 'running', durationMinutes, distanceKm })
}

export function estimateCaloriesWalking(distanceKm: number, durationMinutes: number): number {
  return calculateCalories({ type: 'walking', durationMinutes, distanceKm })
}

export function estimateCaloriesGym(durationMinutes: number, intensity: IntensityLevel): number {
  return calculateCalories({ type: 'gym', durationMinutes, intensityLevel: intensity })
}
