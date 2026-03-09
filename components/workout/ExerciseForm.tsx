'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react'
import type { DraftExercise, DraftSet } from '@/types/database'
import { TEXT } from '@/constants/text'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { calculateVolume } from '@/utils/pace'

interface ExerciseFormProps {
  exercise: DraftExercise
  index: number
  onUpdate: (tempId: string, updates: Partial<DraftExercise>) => void
  onRemove: (tempId: string) => void
  onAddSet: (tempId: string, set: DraftSet) => void
  onUpdateSet: (exerciseTempId: string, setTempId: string, updates: Partial<DraftSet>) => void
  onRemoveSet: (exerciseTempId: string, setTempId: string) => void
}

export function ExerciseForm({
  exercise,
  index,
  onUpdate,
  onRemove,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
}: ExerciseFormProps) {
  const [expanded, setExpanded] = useState(true)
  const volume = calculateVolume(exercise.sets)

  const handleAddSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1]
    const newSet: DraftSet = {
      tempId: `set-${Date.now()}`,
      weight: lastSet?.weight ?? 0,
      repetitions: lastSet?.repetitions ?? 10,
    }
    onAddSet(exercise.tempId, newSet)
  }

  return (
    <Card className="border border-surface-elevated">
      {/* Exercise header */}
      <div
        className="flex items-center justify-between cursor-pointer -m-4 p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onRemove(exercise.tempId) }}
            className="p-1.5 text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end ml-2">
          {volume > 0 && (
            <Badge variant="brand">{volume.toLocaleString()} ק"ג</Badge>
          )}
          <span className="font-semibold text-white">{exercise.exerciseName}</span>
          <span className="text-gray-500 text-sm">#{index + 1}</span>
        </div>
      </div>

      {/* Sets */}
      {expanded && (
        <div className="mt-4 space-y-3">
          {/* Column headers */}
          <div className="flex items-center gap-2 text-xs text-gray-500 text-right">
            <div className="flex-1 text-center">{TEXT.exercises.reps}</div>
            <div className="flex-1 text-center">{TEXT.exercises.weight}</div>
            <div className="w-8 text-center">{TEXT.exercises.set}</div>
            <div className="w-8" />
          </div>

          {exercise.sets.map((set, idx) => (
            <div key={set.tempId} className="flex items-center gap-2">
              <Input
                type="number"
                value={set.repetitions || ''}
                onChange={(e) =>
                  onUpdateSet(exercise.tempId, set.tempId, {
                    repetitions: parseInt(e.target.value) || 0,
                  })
                }
                className="flex-1 py-2 text-center text-sm"
                min="0"
                inputMode="numeric"
              />
              <Input
                type="number"
                value={set.weight || ''}
                onChange={(e) =>
                  onUpdateSet(exercise.tempId, set.tempId, {
                    weight: parseFloat(e.target.value) || 0,
                  })
                }
                className="flex-1 py-2 text-center text-sm"
                min="0"
                step="0.5"
                inputMode="decimal"
              />
              <div className="w-8 text-center text-sm font-medium text-gray-400">
                {idx + 1}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveSet(exercise.tempId, set.tempId)}
                className="w-8 p-1.5 text-gray-500 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddSet}
            fullWidth
            className="border border-dashed border-surface-elevated mt-2"
          >
            <Plus className="w-4 h-4" />
            {TEXT.exercises.addSet}
          </Button>
        </div>
      )}
    </Card>
  )
}
