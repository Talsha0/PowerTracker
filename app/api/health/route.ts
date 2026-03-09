import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const results: Record<string, unknown> = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'MISSING',
    anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10) ?? 'MISSING',
    anonKeyFormat: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ')
      ? 'valid JWT'
      : 'INVALID — must start with eyJ',
  }

  try {
    const supabase = await createClient()
    const start = Date.now()
    const { error, count } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
    results.dbPingMs = Date.now() - start
    results.dbError = error?.message ?? null
    results.dbReachable = !error
  } catch (err) {
    results.dbReachable = false
    results.dbError = String(err)
  }

  return NextResponse.json(results)
}
