import type { Workout } from '@/types/database'
import { TEXT } from '@/constants/text'

export interface CoachRecommendation {
  type: 'rest' | 'overtraining' | 'consistency' | 'progressive_overload' | 'general'
  message: string
  priority: 'high' | 'medium' | 'low'
}

/**
 * Rule-based AI coach recommendations.
 * Architecture allows future swap to OpenAI API.
 */
export function generateCoachRecommendations(
  workouts: Workout[],
  streakDays: number
): CoachRecommendation[] {
  const recommendations: CoachRecommendation[] = []
  const now = new Date()
  const last7Days = workouts.filter(w => {
    const d = new Date(w.created_at)
    return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7
  })
  const last3Days = workouts.filter(w => {
    const d = new Date(w.created_at)
    return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 3
  })

  // Check for consecutive days (potential overtraining)
  if (last3Days.length >= 3) {
    const uniqueDays = new Set(last3Days.map(w => new Date(w.created_at).toDateString()))
    if (uniqueDays.size >= 3) {
      recommendations.push({
        type: 'rest',
        message: TEXT.aiCoach.tips.rest,
        priority: 'high',
      })
    }
  }

  // High frequency warning
  if (last7Days.length >= 7) {
    recommendations.push({
      type: 'overtraining',
      message: TEXT.aiCoach.tips.overtraining,
      priority: 'high',
    })
  }

  // Consistency encouragement
  if (streakDays >= 7) {
    recommendations.push({
      type: 'consistency',
      message: TEXT.aiCoach.tips.consistency,
      priority: 'low',
    })
  }

  // Progressive overload suggestion (after 2 weeks of gym)
  const gymWorkouts = workouts.filter(w => w.type === 'gym')
  if (gymWorkouts.length >= 4) {
    recommendations.push({
      type: 'progressive_overload',
      message: TEXT.aiCoach.tips.progressiveOverload,
      priority: 'medium',
    })
  }

  // General tips if no specific recommendations
  if (recommendations.length === 0) {
    if (workouts.length === 0) {
      recommendations.push({
        type: 'general',
        message: TEXT.aiCoach.tips.beginnerAdvice,
        priority: 'low',
      })
    } else {
      recommendations.push({
        type: 'general',
        message: TEXT.aiCoach.tips.hydration,
        priority: 'low',
      })
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}
