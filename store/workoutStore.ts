import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DraftData, DraftExercise, DraftSet } from '@/types/database'

interface WorkoutState {
  draft: DraftData | null
  setDraft: (draft: DraftData | null) => void
  updateDraft: (updates: Partial<DraftData>) => void
  addExercise: (exercise: DraftExercise) => void
  updateExercise: (tempId: string, updates: Partial<DraftExercise>) => void
  removeExercise: (tempId: string) => void
  addSet: (exerciseTempId: string, set: DraftSet) => void
  updateSet: (exerciseTempId: string, setTempId: string, updates: Partial<DraftSet>) => void
  removeSet: (exerciseTempId: string, setTempId: string) => void
  clearDraft: () => void
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      draft: null,

      setDraft: (draft) => set({ draft }),

      updateDraft: (updates) =>
        set((state) => ({
          draft: state.draft ? { ...state.draft, ...updates } : null,
        })),

      addExercise: (exercise) =>
        set((state) => ({
          draft: state.draft
            ? { ...state.draft, exercises: [...(state.draft.exercises ?? []), exercise] }
            : null,
        })),

      updateExercise: (tempId, updates) =>
        set((state) => ({
          draft: state.draft
            ? {
                ...state.draft,
                exercises: (state.draft.exercises ?? []).map((e) =>
                  e.tempId === tempId ? { ...e, ...updates } : e
                ),
              }
            : null,
        })),

      removeExercise: (tempId) =>
        set((state) => ({
          draft: state.draft
            ? {
                ...state.draft,
                exercises: (state.draft.exercises ?? []).filter((e) => e.tempId !== tempId),
              }
            : null,
        })),

      addSet: (exerciseTempId, set_) =>
        set((state) => ({
          draft: state.draft
            ? {
                ...state.draft,
                exercises: (state.draft.exercises ?? []).map((e) =>
                  e.tempId === exerciseTempId
                    ? { ...e, sets: [...e.sets, set_] }
                    : e
                ),
              }
            : null,
        })),

      updateSet: (exerciseTempId, setTempId, updates) =>
        set((state) => ({
          draft: state.draft
            ? {
                ...state.draft,
                exercises: (state.draft.exercises ?? []).map((e) =>
                  e.tempId === exerciseTempId
                    ? {
                        ...e,
                        sets: e.sets.map((s) =>
                          s.tempId === setTempId ? { ...s, ...updates } : s
                        ),
                      }
                    : e
                ),
              }
            : null,
        })),

      removeSet: (exerciseTempId, setTempId) =>
        set((state) => ({
          draft: state.draft
            ? {
                ...state.draft,
                exercises: (state.draft.exercises ?? []).map((e) =>
                  e.tempId === exerciseTempId
                    ? { ...e, sets: e.sets.filter((s) => s.tempId !== setTempId) }
                    : e
                ),
              }
            : null,
        })),

      clearDraft: () => set({ draft: null }),
    }),
    {
      name: 'powertracker-workout-draft',
      partialize: (state) => ({ draft: state.draft }),
    }
  )
)
