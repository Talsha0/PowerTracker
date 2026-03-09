import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const results: Record<string, unknown> = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'MISSING',
    anonKeyFormat: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ')
      ? 'valid JWT'
      : 'INVALID — must start with eyJ',
  }

  try {
    const supabase = await createClient()

    // Ping
    const t0 = Date.now()
    const { error: pingError } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
    results.pingMs = Date.now() - t0
    results.pingError = pingError?.message ?? null

    // Check each table exists and is readable
    const tables = ['users', 'workouts', 'workout_drafts', 'exercise_library']
    const tableResults: Record<string, string> = {}
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*', { count: 'exact', head: true })
      tableResults[table] = error ? `ERROR: ${error.message} (${error.code})` : 'ok'
    }
    results.tables = tableResults

    // Check auth trigger exists
    const { data: trigger } = await supabase
      .rpc('pg_catalog.pg_trigger' as any)
      .limit(1)
      .maybeSingle()
    results.triggerCheck = 'run SELECT * FROM pg_trigger WHERE tgname = \'on_auth_user_created\' in SQL editor to verify'

  } catch (err) {
    results.fatalError = String(err)
  }

  return NextResponse.json(results, { status: 200 })
}
