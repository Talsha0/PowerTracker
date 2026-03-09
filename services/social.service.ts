import { getSupabaseClient } from '@/lib/supabase/client'
import type { Friendship, User, WorkoutComment } from '@/types/database'

const supabase = () => getSupabaseClient()

export async function searchUsers(query: string, currentUserId: string): Promise<User[]> {
  const { data, error } = await supabase()
    .from('users')
    .select('id, email, username, avatar_url, created_at')
    .ilike('username', `%${query}%`)
    .neq('id', currentUserId)
    .limit(20)

  if (error) throw error
  return data ?? []
}

export async function getFriends(userId: string): Promise<Friendship[]> {
  const { data, error } = await supabase()
    .from('friendships')
    .select('*, friend:friend_id(id, username, avatar_url, email, created_at), user:user_id(id, username, avatar_url, email, created_at)')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted')

  if (error) throw error
  return (data ?? []) as Friendship[]
}

export async function getPendingRequests(userId: string): Promise<Friendship[]> {
  const { data, error } = await supabase()
    .from('friendships')
    .select('*, user:user_id(id, username, avatar_url, email, created_at)')
    .eq('friend_id', userId)
    .eq('status', 'pending')

  if (error) throw error
  return (data ?? []) as Friendship[]
}

export async function getSentRequests(userId: string): Promise<Friendship[]> {
  const { data, error } = await supabase()
    .from('friendships')
    .select('*, friend:friend_id(id, username, avatar_url, email, created_at)')
    .eq('user_id', userId)
    .eq('status', 'pending')

  if (error) throw error
  return (data ?? []) as Friendship[]
}

export async function sendFriendRequest(userId: string, friendId: string): Promise<Friendship> {
  const { data, error } = await supabase()
    .from('friendships')
    .insert({ user_id: userId, friend_id: friendId, status: 'pending' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function respondToFriendRequest(
  friendshipId: string,
  status: 'accepted' | 'rejected'
): Promise<void> {
  const { error } = await supabase()
    .from('friendships')
    .update({ status })
    .eq('id', friendshipId)

  if (error) throw error
}

export async function removeFriend(friendshipId: string): Promise<void> {
  const { error } = await supabase().from('friendships').delete().eq('id', friendshipId)
  if (error) throw error
}

export async function getWorkoutComments(workoutId: string): Promise<WorkoutComment[]> {
  const { data, error } = await supabase()
    .from('workout_comments')
    .select('*, users(id, username, avatar_url)')
    .eq('workout_id', workoutId)
    .order('created_at')

  if (error) throw error
  return (data ?? []) as WorkoutComment[]
}

export async function addComment(
  workoutId: string,
  userId: string,
  text: string
): Promise<WorkoutComment> {
  const { data, error } = await supabase()
    .from('workout_comments')
    .insert({ workout_id: workoutId, user_id: userId, comment_text: text })
    .select('*, users(id, username, avatar_url)')
    .single()

  if (error) throw error
  return data as WorkoutComment
}

export async function getLeaderboard(
  userId: string,
  metric: 'workouts' | 'streak' | 'distance'
): Promise<Array<{ user: User; value: number; rank: number }>> {
  // Get friend IDs
  const { data: friendships } = await supabase()
    .from('friendships')
    .select('friend_id, user_id')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted')

  const friendIds = (friendships ?? []).map(f =>
    f.user_id === userId ? f.friend_id : f.user_id
  )
  const allIds = [userId, ...friendIds]

  // Weekly workouts count
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { data: workouts } = await supabase()
    .from('workouts')
    .select('user_id, distance_km, created_at')
    .in('user_id', allIds)
    .gte('created_at', weekAgo.toISOString())

  const { data: users } = await supabase()
    .from('users')
    .select('id, username, avatar_url, email, created_at')
    .in('id', allIds)

  const userMap = new Map((users ?? []).map(u => [u.id, u]))
  const valueMap = new Map<string, number>()

  for (const id of allIds) {
    const userWorkouts = (workouts ?? []).filter(w => w.user_id === id)
    if (metric === 'workouts') {
      valueMap.set(id, userWorkouts.length)
    } else if (metric === 'distance') {
      valueMap.set(id, userWorkouts.reduce((sum, w) => sum + (w.distance_km ?? 0), 0))
    } else {
      valueMap.set(id, 0) // Streak requires more complex calculation
    }
  }

  return allIds
    .map(id => ({ user: userMap.get(id)! as User, value: valueMap.get(id) ?? 0 }))
    .filter(e => e.user)
    .sort((a, b) => b.value - a.value)
    .map((e, idx) => ({ ...e, rank: idx + 1 }))
}
