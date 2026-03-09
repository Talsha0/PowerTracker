export type WorkoutType = 'running' | 'walking' | 'gym'
export type WorkoutVisibility = 'private' | 'friends'
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected'
export type IntensityLevel = 1 | 2 | 3 | 4 | 5

export type GymCategory =
  | 'legs'
  | 'chest_back'
  | 'arms_shoulders'
  | 'push'
  | 'pull'
  | 'custom'

export interface User {
  id: string
  email: string
  username: string
  avatar_url: string | null
  created_at: string
}

export interface Workout {
  id: string
  user_id: string
  type: WorkoutType
  distance_km: number | null
  duration_minutes: number | null
  intensity_level: IntensityLevel | null
  calories_burned: number | null
  visibility: WorkoutVisibility
  notes: string | null
  gym_category: string | null
  created_at: string
  updated_at: string
}

export interface WorkoutWithUser extends Workout {
  users: Pick<User, 'id' | 'username' | 'avatar_url'>
}

export interface CustomWorkoutType {
  id: string
  user_id: string
  name: string
}

export interface ExerciseLibrary {
  id: string
  user_id: string | null
  name: string
  image_url: string | null
  created_at: string
}

export interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  exercise_order: number
  exercise_library?: ExerciseLibrary
  exercise_sets?: ExerciseSet[]
}

export interface ExerciseSet {
  id: string
  workout_exercise_id: string
  set_number: number
  weight: number
  repetitions: number
}

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: FriendshipStatus
  created_at: string
  friend?: User
  user?: User
}

export interface WorkoutComment {
  id: string
  workout_id: string
  user_id: string
  comment_text: string
  created_at: string
  users?: Pick<User, 'id' | 'username' | 'avatar_url'>
}

export interface WorkoutImage {
  id: string
  workout_id: string
  image_url: string
}

export interface WorkoutDraft {
  id: string
  user_id: string
  draft_data: DraftData
  updated_at: string
}

export interface DraftData {
  type: WorkoutType
  distance_km?: number
  duration_minutes?: number
  intensity_level?: IntensityLevel
  gym_category?: string
  notes?: string
  exercises?: DraftExercise[]
  startedAt: string
}

export interface DraftExercise {
  tempId: string
  exerciseId?: string
  exerciseName: string
  sets: DraftSet[]
}

export interface DraftSet {
  tempId: string
  weight: number
  repetitions: number
}

export interface WeeklyGoal {
  workoutsPerWeek?: number
  runningDistanceKm?: number
  gymSessionsPerWeek?: number
}

export interface PersonalRecord {
  longestRun?: number
  fastestPace?: number
  heaviestWeights: Record<string, number>
  highestVolume?: number
}

export interface Analytics {
  totalWorkouts: number
  totalDistanceKm: number
  totalDurationMinutes: number
  workoutsByType: Record<WorkoutType, number>
  recentWorkouts: Workout[]
  streak: number
  weeklyWorkouts: number
}
