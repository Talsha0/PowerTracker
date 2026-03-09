'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from '@/services/auth.service'
import { TEXT } from '@/constants/text'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email: z.string().email(TEXT.auth.invalidEmail),
  password: z.string().min(6, TEXT.auth.weakPassword),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await signIn(data.email, data.password)
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError(TEXT.auth.loginError)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-bold text-white text-right mb-6">{TEXT.auth.login}</h2>

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
        autoComplete="current-password"
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-right">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        {TEXT.auth.loginButton}
      </Button>

      <p className="text-center text-gray-400 text-sm">
        <Link href="/register" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
          {TEXT.auth.registerButton}
        </Link>
        {' '}?{TEXT.auth.noAccount}
      </p>
    </form>
  )
}
