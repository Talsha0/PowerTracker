-- =============================================================================
-- PowerTracker - Row Level Security Policies
-- Run AFTER schema.sql in Supabase SQL Editor
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_workout_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_library  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_drafts    ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USERS
-- =============================================================================

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view other users (for search)"
  ON public.users FOR SELECT
  USING (true); -- Read-only public profiles for friend search

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- WORKOUTS
-- =============================================================================

-- Helper function: check if two users are friends
CREATE OR REPLACE FUNCTION public.are_friends(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND (
        (user_id = user_a AND friend_id = user_b) OR
        (user_id = user_b AND friend_id = user_a)
      )
  );
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE POLICY "Users can view own workouts"
  ON public.workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Friends can view shared workouts"
  ON public.workouts FOR SELECT
  USING (
    visibility = 'friends' AND
    are_friends(auth.uid(), user_id)
  );

CREATE POLICY "Users can create own workouts"
  ON public.workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON public.workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON public.workouts FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- CUSTOM WORKOUT TYPES
-- =============================================================================

CREATE POLICY "Users manage own workout types"
  ON public.custom_workout_types FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- EXERCISE LIBRARY
-- =============================================================================

CREATE POLICY "Anyone can view global exercises"
  ON public.exercise_library FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create custom exercises"
  ON public.exercise_library FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercises"
  ON public.exercise_library FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises"
  ON public.exercise_library FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- WORKOUT EXERCISES
-- =============================================================================

CREATE POLICY "Users can manage exercises in own workouts"
  ON public.workout_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE id = workout_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE id = workout_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Friends can view exercises in shared workouts"
  ON public.workout_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts w
      WHERE w.id = workout_id
        AND w.visibility = 'friends'
        AND are_friends(auth.uid(), w.user_id)
    )
  );

-- =============================================================================
-- EXERCISE SETS
-- =============================================================================

CREATE POLICY "Users can manage sets in own workouts"
  ON public.exercise_sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_exercises we
      JOIN public.workouts w ON w.id = we.workout_id
      WHERE we.id = workout_exercise_id AND w.user_id = auth.uid()
    )
  );

-- =============================================================================
-- FRIENDSHIPS
-- =============================================================================

CREATE POLICY "Users can view their own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can send friend requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can respond to friend requests"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = friend_id OR auth.uid() = user_id);

CREATE POLICY "Users can remove friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- =============================================================================
-- WORKOUT COMMENTS
-- =============================================================================

CREATE POLICY "Users can view comments on visible workouts"
  ON public.workout_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts w
      WHERE w.id = workout_id
        AND (
          w.user_id = auth.uid() OR
          (w.visibility = 'friends' AND are_friends(auth.uid(), w.user_id))
        )
    )
  );

CREATE POLICY "Users can comment on visible workouts"
  ON public.workout_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.workouts w
      WHERE w.id = workout_id
        AND (
          w.user_id = auth.uid() OR
          (w.visibility = 'friends' AND are_friends(auth.uid(), w.user_id))
        )
    )
  );

CREATE POLICY "Users can delete own comments"
  ON public.workout_comments FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- WORKOUT IMAGES
-- =============================================================================

CREATE POLICY "Users can manage images on own workouts"
  ON public.workout_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE id = workout_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Friends can view images on shared workouts"
  ON public.workout_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts w
      WHERE w.id = workout_id
        AND w.visibility = 'friends'
        AND are_friends(auth.uid(), w.user_id)
    )
  );

-- =============================================================================
-- WORKOUT DRAFTS
-- =============================================================================

CREATE POLICY "Users can manage own drafts"
  ON public.workout_drafts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
