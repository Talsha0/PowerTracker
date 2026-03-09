'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserCircle2, Camera, LogOut, Target, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { signOut, updateProfile, uploadAvatar } from '@/services/auth.service'
import { TEXT } from '@/constants/text'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/LoadingSpinner'

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const { weeklyGoals, setWeeklyGoals, setUser } = useAuthStore()
  const queryClient = useQueryClient()

  const [username, setUsername] = useState(user?.username ?? '')
  const [goalWorkouts, setGoalWorkouts] = useState(weeklyGoals.workoutsPerWeek?.toString() ?? '')
  const [goalDistance, setGoalDistance] = useState(weeklyGoals.runningDistanceKm?.toString() ?? '')
  const [goalGym, setGoalGym] = useState(weeklyGoals.gymSessionsPerWeek?.toString() ?? '')
  const [savedGoals, setSavedGoals] = useState(false)

  const { mutate: updateUser, isPending: updatingProfile } = useMutation({
    mutationFn: () => updateProfile(user!.id, { username }),
    onSuccess: (updated) => {
      setUser(updated)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  const { mutate: logout } = useMutation({
    mutationFn: signOut,
  })

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const url = await uploadAvatar(user.id, file)
    await updateProfile(user.id, { avatar_url: url })
    setUser({ ...user, avatar_url: url })
  }

  const handleSaveGoals = () => {
    setWeeklyGoals({
      workoutsPerWeek: parseInt(goalWorkouts) || undefined,
      runningDistanceKm: parseFloat(goalDistance) || undefined,
      gymSessionsPerWeek: parseInt(goalGym) || undefined,
    })
    setSavedGoals(true)
    setTimeout(() => setSavedGoals(false), 2000)
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="page-container">
      <Header title={TEXT.profile.title} />

      <div className="space-y-5 mt-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.username}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-500/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-surface-card flex items-center justify-center ring-4 ring-surface-border">
                <UserCircle2 className="w-14 h-14 text-gray-500" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">{user?.username}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        {/* Edit profile */}
        <Card>
          <h3 className="font-bold text-white text-right mb-4">{TEXT.profile.editProfile}</h3>
          <div className="space-y-3">
            <Input
              label={TEXT.profile.username}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button
              fullWidth
              onClick={() => updateUser()}
              loading={updatingProfile}
              variant="secondary"
            >
              {TEXT.app.save}
            </Button>
          </div>
        </Card>

        {/* Weekly Goals */}
        <Card>
          <div className="flex items-center justify-end gap-2 mb-4">
            {savedGoals && <CheckCircle2 className="w-5 h-5 text-green-400 animate-fade-in" />}
            <h3 className="font-bold text-white">{TEXT.profile.weeklyGoals}</h3>
            <Target className="w-5 h-5 text-brand-400" />
          </div>

          <div className="space-y-3">
            <Input
              type="number"
              label={TEXT.profile.workoutsPerWeek}
              value={goalWorkouts}
              onChange={(e) => setGoalWorkouts(e.target.value)}
              inputMode="numeric"
              min="0"
              max="14"
              suffix="אימונים"
            />
            <Input
              type="number"
              label={TEXT.profile.runningDistance}
              value={goalDistance}
              onChange={(e) => setGoalDistance(e.target.value)}
              inputMode="decimal"
              min="0"
              suffix='ק"מ'
            />
            <Input
              type="number"
              label={TEXT.profile.gymSessions}
              value={goalGym}
              onChange={(e) => setGoalGym(e.target.value)}
              inputMode="numeric"
              min="0"
              max="7"
              suffix="אימונים"
            />
            <Button fullWidth onClick={handleSaveGoals} variant="secondary">
              {TEXT.profile.saveGoals}
            </Button>
          </div>
        </Card>

        {/* Logout */}
        <Button
          variant="danger"
          fullWidth
          onClick={() => logout()}
          className="mt-2"
        >
          <LogOut className="w-4 h-4" />
          {TEXT.auth.logout}
        </Button>

        <p className="text-center text-gray-600 text-xs pb-4">
          PowerTracker v1.0.0
        </p>
      </div>
    </div>
  )
}
