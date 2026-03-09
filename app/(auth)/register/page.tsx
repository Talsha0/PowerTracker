'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signUp, getCurrentUser } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { TEXT } from '@/constants/text'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z
  .object({
    username: z.string().min(3, 'שם משתמש חייב להכיל לפחות 3 תווים').max(30),
    email: z.string().email(TEXT.auth.invalidEmail),
    password: z.string().min(6, TEXT.auth.weakPassword),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: TEXT.auth.passwordMismatch,
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await signUp(data.email, data.password, data.username)
      // Load user into store immediately so dashboard doesn't open with user=null
      const user = await getCurrentUser()
      setUser(user)
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err?.message ?? ''
      if (msg.includes('already registered')) {
        setError(TEXT.auth.emailTaken)
      } else {
        setError(TEXT.auth.registerError)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-bold text-white text-right mb-6">{TEXT.auth.register}</h2>

      <Input
        {...register('username')}
        type="text"
        label={TEXT.auth.username}
        placeholder="שם_משתמש"
        error={errors.username?.message}
        autoComplete="username"
        autoCapitalize="none"
      />

      <Input
        {...register('email')}
        type="email"
        label={TEXT.auth.email}
        placeholder="your@email.com"
        error={errors.email?.message}
        autoComplete="email"
        inputMode="email"
      />

      <Input
        {...register('password')}
        type="password"
        label={TEXT.auth.password}
        placeholder="••••••••"
        error={errors.password?.message}
        autoComplete="new-password"
      />

      <Input
        {...register('confirmPassword')}
        type="password"
        label={TEXT.auth.confirmPassword}
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-right">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        {TEXT.auth.registerButton}
      </Button>

      <p className="text-center text-gray-400 text-sm">
        <Link href="/login" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
          {TEXT.auth.loginButton}
        </Link>
        {' '}?{TEXT.auth.hasAccount}
      </p>
    </form>
  )
}
