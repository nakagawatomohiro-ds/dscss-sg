/**
 * Supabase Sync - SG Quiz App to CSJ Supabase DB
 */
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

async function sbPost(table: string, body: unknown): Promise<boolean> {
  if (!SB_URL || !SB_KEY) return false
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(body),
    })
    return r.ok
  } catch {
    return false
  }
}

export const syncQuizResult = (did: string, cat: string, lvl: string, score: number, total: number) =>
  sbPost('sg_quiz_results', {
    device_id: did, category_id: cat, level_id: lvl,
    score, total, finished: true, updated_at: new Date().toISOString(),
  })

export const syncMockResult = (did: string, score: number, total: number) =>
  sbPost('sg_mock_results', {
    device_id: did, score, total, created_at: new Date().toISOString(),
  })

export const syncWrongAnswer = (did: string, qid: number) =>
  sbPost('sg_wrong_answers', {
    device_id: did, question_id: qid, created_at: new Date().toISOString(),
  })

export const isSupabaseConfigured = () => !!(SB_URL && SB_KEY)
