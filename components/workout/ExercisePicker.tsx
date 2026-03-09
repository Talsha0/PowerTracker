'use client'

import { useState } from 'react'
import { Search, Plus, X, Dumbbell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { ExerciseLibrary } from '@/types/database'
import { getExerciseLibrary, createCustomExercise } from '@/services/exercise.service'
import { TEXT } from '@/constants/text'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import Image from 'next/image'

interface ExercisePickerProps {
  userId: string
  open: boolean
  onClose: () => void
  onSelect: (exercise: ExerciseLibrary) => void
}

export function ExercisePicker({ userId, open, onClose, onSelect }: ExercisePickerProps) {
  const [search, setSearch] = useState('')
  const [creatingNew, setCreatingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const { data: exercises = [], refetch } = useQuery({
    queryKey: ['exercises', userId],
    queryFn: () => getExerciseLibrary(userId),
    enabled: open,
  })

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const ex = await createCustomExercise(userId, newName.trim())
      await refetch()
      onSelect(ex)
      setNewName('')
      setCreatingNew(false)
      onClose()
    } finally {
      setCreating(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={TEXT.exercises.title} size="lg">
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {/* Search */}
        <div className="relative">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={TEXT.exercises.search}
            className="pr-10"
          />
          <Search className="absolute right-3 top-3.5 w-4 h-4 text-gray-500" />
        </div>

        {/* Create new */}
        {creatingNew ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreatingNew(false)}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={TEXT.exercises.namePlaceholder}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <Button size="sm" onClick={handleCreate} loading={creating} className="shrink-0">
              {TEXT.app.add}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => setCreatingNew(true)}
          >
            <Plus className="w-4 h-4" />
            {TEXT.exercises.addNew}
          </Button>
        )}

        {/* Exercise list */}
        <div className="space-y-1">
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => { onSelect(exercise); onClose() }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-elevated active:bg-surface-elevated/80 transition-colors text-right"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center shrink-0">
                {exercise.image_url ? (
                  <Image
                    src={exercise.image_url}
                    alt={exercise.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Dumbbell className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <span className="text-white font-medium flex-1">{exercise.name}</span>
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-6 text-sm">{TEXT.app.noResults}</p>
          )}
        </div>
      </div>
    </Modal>
  )
}
