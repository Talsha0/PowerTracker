'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Users, Bell, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import {
  getFriends,
  getPendingRequests,
  searchUsers,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
} from '@/services/social.service'
import { getFriendsWorkouts } from '@/services/workout.service'
import { TEXT } from '@/constants/text'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { WorkoutCard } from '@/components/workout/WorkoutCard'
import { FriendCard } from '@/components/social/FriendCard'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'

type Tab = 'feed' | 'friends' | 'requests' | 'search'

export default function SocialPage() {
  const { user, isLoading } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: () => getFriends(user!.id),
    enabled: !!user,
  })

  const { data: requests = [] } = useQuery({
    queryKey: ['friend-requests', user?.id],
    queryFn: () => getPendingRequests(user!.id),
    enabled: !!user,
  })

  const { data: feedWorkouts = [] } = useQuery({
    queryKey: ['feed', user?.id],
    queryFn: () => getFriendsWorkouts(user!.id),
    enabled: !!user && activeTab === 'feed',
  })

  const { data: searchResults = [] } = useQuery({
    queryKey: ['user-search', searchQuery, user?.id],
    queryFn: () => searchUsers(searchQuery, user!.id),
    enabled: !!user && searchQuery.length >= 2 && activeTab === 'search',
  })

  const { mutate: acceptRequest } = useMutation({
    mutationFn: (id: string) => respondToFriendRequest(id, 'accepted'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })

  const { mutate: rejectRequest } = useMutation({
    mutationFn: (id: string) => respondToFriendRequest(id, 'rejected'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friend-requests'] }),
  })

  const { mutate: sendRequest } = useMutation({
    mutationFn: (friendId: string) => sendFriendRequest(user!.id, friendId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-search'] }),
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => removeFriend(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friends'] }),
  })

  if (isLoading) return <PageLoader />

  const tabs: Array<{ id: Tab; label: string; icon: typeof Search; badge?: number }> = [
    { id: 'feed', label: 'פיד', icon: Users },
    { id: 'friends', label: TEXT.social.friends, icon: Users },
    { id: 'requests', label: 'בקשות', icon: Bell, badge: requests.length },
    { id: 'search', label: TEXT.social.searchUsers.substring(0, 4), icon: Search },
  ]

  return (
    <div className="page-container">
      <Header
        title={TEXT.social.title}
        rightAction={
          <Link href="/social/leaderboard">
            <Button variant="ghost" size="sm" className="p-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </Button>
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card rounded-xl p-1 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white'
                : 'text-gray-400'
            }`}
          >
            {tab.label}
            {tab.badge ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {/* Feed */}
        {activeTab === 'feed' && (
          feedWorkouts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">{TEXT.social.noFeedItems}</p>
              <p className="text-gray-500 text-sm mt-1">הוסף חברים לראות את האימונים שלהם</p>
            </div>
          ) : (
            feedWorkouts.map((w) => (
              <WorkoutCard
                key={w.id}
                workout={w}
                showUser
                username={w.users?.username}
              />
            ))
          )
        )}

        {/* Friends list */}
        {activeTab === 'friends' && (
          friends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">{TEXT.social.noFriends}</p>
            </div>
          ) : (
            friends.map((f) => {
              const friend = f.user_id === user?.id ? f.friend : f.user
              return friend ? (
                <FriendCard
                  key={f.id}
                  user={friend as any}
                  friendship={f}
                  onRemove={remove}
                />
              ) : null
            })
          )
        )}

        {/* Friend requests */}
        {activeTab === 'requests' && (
          requests.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">אין בקשות חדשות</p>
            </div>
          ) : (
            requests.map((req) => (
              req.user ? (
                <FriendCard
                  key={req.id}
                  user={req.user as any}
                  friendship={req}
                  isPending
                  onAccept={acceptRequest}
                  onReject={rejectRequest}
                />
              ) : null
            ))
          )
        )}

        {/* Search */}
        {activeTab === 'search' && (
          <>
            <div className="relative mb-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={TEXT.social.searchPlaceholder}
                className="pr-10"
                autoFocus
              />
              <Search className="absolute right-3 top-3.5 w-4 h-4 text-gray-500" />
            </div>

            {searchResults.map((u) => {
              const isFriend = friends.some(
                (f) => f.friend_id === u.id || f.user_id === u.id
              )
              return (
                <FriendCard
                  key={u.id}
                  user={u}
                  onSendRequest={isFriend ? undefined : sendRequest}
                />
              )
            })}

            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-center text-gray-500 py-6">{TEXT.app.noResults}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
