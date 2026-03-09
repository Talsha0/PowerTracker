/**
 * Calculate pace in min/km from distance and duration
 */
export function calculatePace(distanceKm: number, durationMinutes: number): number | null {
  if (!distanceKm || !durationMinutes || distanceKm <= 0) return null
  return durationMinutes / distanceKm
}

/**
 * Format pace as "M:SS" string
 */
export function formatPace(paceMinPerKm: number): string {
  const minutes = Math.floor(paceMinPerKm)
  const seconds = Math.round((paceMinPerKm - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Format duration in minutes as "Xש Xד" (Hebrew hours/minutes)
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}ד`
  if (m === 0) return `${h}ש`
  return `${h}ש ${m}ד`
}

/**
 * Format distance with one decimal
 */
export function formatDistance(km: number): string {
  return km.toFixed(1)
}

/**
 * Calculate total exercise volume (weight × reps) across all sets
 */
export function calculateVolume(sets: Array<{ weight: number; repetitions: number }>): number {
  return sets.reduce((sum, s) => sum + s.weight * s.repetitions, 0)
}
