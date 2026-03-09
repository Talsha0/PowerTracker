-- =============================================================================
-- PowerTracker - PostgreSQL Schema
-- Run this in Supabase SQL Editor (Project > SQL Editor > New Query)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users (mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  username    TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Workouts
CREATE TABLE IF NOT EXISTS public.workouts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type              TEXT NOT NULL CHECK (type IN ('running', 'walking', 'gym')),
  distance_km       NUMERIC(8, 2),
  duration_minutes  NUMERIC(8, 1),
  intensity_level   INTEGER CHECK (intensity_level BETWEEN 1 AND 5),
  calories_burned   NUMERIC(8, 1),
  visibility        TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'friends')),
  notes             TEXT,
  gym_category      TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Custom workout types per user
CREATE TABLE IF NOT EXISTS public.custom_workout_types (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name     TEXT NOT NULL
);

-- Exercise library (global + user-specific)
CREATE TABLE IF NOT EXISTS public.exercise_library (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  image_url  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Exercises within a workout session
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id     UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id    UUID NOT NULL REFERENCES public.exercise_library(id) ON DELETE RESTRICT,
  exercise_order INTEGER NOT NULL DEFAULT 0
);

-- Sets within a workout exercise
CREATE TABLE IF NOT EXISTS public.exercise_sets (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_exercise_id UUID NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
  set_number          INTEGER NOT NULL,
  weight              NUMERIC(8, 2) NOT NULL DEFAULT 0,
  repetitions         INTEGER NOT NULL DEFAULT 0
);

-- Friendships / social graph
CREATE TABLE IF NOT EXISTS public.friendships (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, friend_id)
);

-- Workout comments
CREATE TABLE IF NOT EXISTS public.workout_comments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id   UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Workout images
CREATE TABLE IF NOT EXISTS public.workout_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL
);

-- Workout drafts (autosave)
CREATE TABLE IF NOT EXISTS public.workout_drafts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  draft_data  JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_workouts_user_id     ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_created_at  ON public.workouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_type        ON public.workouts(type);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_we     ON public.exercise_sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_wid ON public.workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id  ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_comments_workout     ON public.workout_comments(workout_id);
CREATE INDEX IF NOT EXISTS idx_exercise_lib_user    ON public.exercise_library(user_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at on workouts
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER drafts_updated_at
  BEFORE UPDATE ON public.workout_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- SEED: Global exercise library
-- =============================================================================

INSERT INTO public.exercise_library (id, user_id, name) VALUES
  (uuid_generate_v4(), NULL, 'לחיצת חזה שוכב'),
  (uuid_generate_v4(), NULL, 'לחיצת כתפיים'),
  (uuid_generate_v4(), NULL, 'סקוואט'),
  (uuid_generate_v4(), NULL, 'מתח'),
  (uuid_generate_v4(), NULL, 'דדליפט'),
  (uuid_generate_v4(), NULL, 'כפיפת ידיים - מוט'),
  (uuid_generate_v4(), NULL, 'כפיפות ברכיים'),
  (uuid_generate_v4(), NULL, 'לחיצת רגליים'),
  (uuid_generate_v4(), NULL, 'פשיטת שוק'),
  (uuid_generate_v4(), NULL, 'מתח צר'),
  (uuid_generate_v4(), NULL, 'שכיבות שמיכה'),
  (uuid_generate_v4(), NULL, 'פרפר חזה'),
  (uuid_generate_v4(), NULL, 'חתירה במוט'),
  (uuid_generate_v4(), NULL, 'הרמת כתפיים'),
  (uuid_generate_v4(), NULL, 'בטן - קראנץ'),
  (uuid_generate_v4(), NULL, 'פלאנק'),
  (uuid_generate_v4(), NULL, 'לגס קרל'),
  (uuid_generate_v4(), NULL, 'לגס אקסטנשן'),
  (uuid_generate_v4(), NULL, 'כפיפות ידיים - דמבל'),
  (uuid_generate_v4(), NULL, 'לחיצת חזה - דמבל')
ON CONFLICT DO NOTHING;
