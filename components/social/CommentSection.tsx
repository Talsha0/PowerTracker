'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { UserCircle2 } from 'lucide-react'
import { getWorkoutComments, addComment } from '@/services/social.service'
import type { WorkoutComment } from '@/types/database'
import { TEXT } from '@/constants/text'
import { Button } from '@/components/ui/Button'

interface CommentSectionProps {
  workoutId: string
  userId: string
}

export function CommentSection({ workoutId, userId }: CommentSectionProps) {
  const [text, setText] = useState('')
  const queryClient = useQueryClient()

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', workoutId],
    queryFn: () => getWorkoutComments(workoutId),
  })

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => addComment(workoutId, userId, text.trim()),
    onSuccess: () => {
      setText('')
      queryClient.invalidateQueries({ queryKey: ['comments', workoutId] })
    },
  })

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white text-right">{TEXT.social.comments}</h3>

      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}

      {comments.length === 0 && (
        <p className="text-gray-500 text-sm text-right py-2">אין תגובות עדיין. היה הראשון!</p>
      )}

      {/* Input */}
      <div className="flex gap-2 items-center pt-2 border-t border-surface-border">
        <Button
          size="sm"
          onClick={() => text.trim() && submit()}
          disabled={!text.trim() || isPending}
          loading={isPending}
          className="shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={TEXT.social.addComment}
          onKeyDown={(e) => e.key === 'Enter' && text.trim() && submit()}
          className="flex-1 bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-white text-right text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          dir="rtl"
        />
      </div>
    </div>
  )
}

function CommentItem({ comment }: { comment: WorkoutComment }) {
  return (
    <div className="flex items-start gap-2.5 text-right">
      <div className="flex-1 bg-surface-elevated rounded-2xl px-3 py-2">
        <p className="text-xs font-semibold text-brand-400 mb-1">{comment.users?.username}</p>
        <p className="text-sm text-gray-200">{comment.comment_text}</p>
        <p className="text-xs text-gray-600 mt-1">
          {new Date(comment.created_at).toLocaleTimeString('he-IL', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
      <div className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center shrink-0">
        {comment.users?.avatar_url ? (
          <Image
            src={comment.users.avatar_url}
            alt={comment.users.username}
            width={32}
            height={32}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <UserCircle2 className="w-5 h-5 text-gray-500" />
        )}
      </div>
    </div>
  )
}
