import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const results: Record<string, unknown> = {
    supabaseUrl: url ?? 'MISSING',
    anonKeyFormat: key?.startsWith('eyJ') ? 'valid JWT' : `INVALID (starts with: ${key?.slice(0, 15)})`,
  }

  if (!url || !key) {
    return NextResponse.json({ ...results, fatal: 'Missing env vars' })
  }

  const supabase = createClient(url, key)

  const tables = ['users', 'workouts', 'workout_drafts', 'exercise_library', 'custom_workout_types']
  const tableResults: Record<string, string> = {}

  for (const table of tables) {
    const t0 = Date.now()
    const { error } = await supabase.from(table).select('*', { count: 'exact', head: true })
    const ms = Date.now() - t0
    tableResults[table] = error
      ? `ERROR ${error.code}: ${error.message}`
      : `ok (${ms}ms)`
  }

  results.tables = tableResults
  return NextResponse.json(results)
}
