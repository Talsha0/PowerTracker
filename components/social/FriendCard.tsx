'use client'

import Image from 'next/image'
import { UserCircle2, UserMinus } from 'lucide-react'
import type { User, Friendship } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { TEXT } from '@/constants/text'

interface FriendCardProps {
  user: User
  friendship?: Friendship
  isPending?: boolean
  isSentRequest?: boolean
  onAccept?: (friendshipId: string) => void
  onReject?: (friendshipId: string) => void
  onSendRequest?: (userId: string) => void
  onRemove?: (friendshipId: string) => void
}

export function FriendCard({
  user,
  friendship,
  isPending,
  isSentRequest,
  onAccept,
  onReject,
  onSendRequest,
  onRemove,
}: FriendCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-card border border-surface-border">
      {/* Avatar */}
      <div className="shrink-0">
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.username}
            width={44}
            height={44}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-surface-elevated flex items-center justify-center">
            <UserCircle2 className="w-7 h-7 text-gray-500" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-right min-w-0">
        <p className="font-semibold text-white truncate">{user.username}</p>
        {friendship?.created_at && !isPending && (
          <p className="text-xs text-gray-500">
            {TEXT.social.friendSince}{' '}
            {new Date(friendship.created_at).toLocaleDateString('he-IL')}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        {isPending && friendship && (
          <>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onReject?.(friendship.id)}
              className="px-3 py-1.5"
            >
              {TEXT.social.reject}
            </Button>
            <Button
              size="sm"
              onClick={() => onAccept?.(friendship.id)}
              className="px-3 py-1.5"
            >
              {TEXT.social.accept}
            </Button>
          </>
        )}
        {isSentRequest && (
          <Button variant="outline" size="sm" disabled className="px-3 py-1.5 text-xs">
            ממתין...
          </Button>
        )}
        {!isPending && !isSentRequest && onSendRequest && (
          <Button
            size="sm"
            onClick={() => onSendRequest(user.id)}
            className="px-3 py-1.5"
          >
            {TEXT.social.sendRequest}
          </Button>
        )}
        {!isPending && !isSentRequest && onRemove && friendship && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(friendship.id)}
            className="p-2 text-gray-500 hover:text-red-400"
          >
            <UserMinus className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
