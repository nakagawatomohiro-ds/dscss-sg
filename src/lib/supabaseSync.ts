/**
 * Supabase Sync Module for SG Quiz App
 * Syncs localStorage quiz data to CSJ Supabase database
 * Uses the existing sg_quiz_results, sg_mock_results, sg_wrong_answers tables
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

interface SupabaseResponse {
    data: unknown[] | null
    error: { message: string } | null
}

async function supabaseRequest(
    table: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    body?: unknown,
    query?: string
  ): Promise<SupabaseResponse> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
          return { data: null, error: { message: 'Supabase not configured' } }
    }

  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`
    const headers: Record<string, string> = {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': method === 'POST' ? 'resolution=merge-duplicates,return=minimal' : 'return=minimal',
    }

  try {
        const res = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
        })

      if (!res.ok) {
              const text = await res.text()
              return { data: null, error: { message: text } }
      }

      if (method === 'GET') {
              const data = await res.json()
              return { data, error: null }
      }
        return { data: [], error: null }
  } catch (e) {
        return { data: null, error: { message: (e as Error).message } }
  }
}

// ===================== Sync Functions =====================

export async function syncQuizResult(
    deviceId: string,
    categoryId: string,
    levelId: string,
    score: number,
    total: number
  ): Promise<void> {
    await supabaseRequest('sg_quiz_results', 'POST', {
          device_id: deviceId,
          category_id: categoryId,
          level_id: levelId,
          score,
          total,
          finished: true,
          updated_at: new Date().toISOString(),
    })
}

export async function syncMockResult(
    deviceId: string,
    score: number,
    total: number
  ): Promise<void> {
    await supabaseRequest('sg_mock_results', 'POST', {
          device_id: deviceId,
          score,
          total,
          created_at: new Date().toISOString(),
    })
}

export async function syncWrongAnswer(
    deviceId: string,
    questionId: number
  ): Promise<void> {
    await supabaseRequest('sg_wrong_answers', 'POST', {
          device_id: deviceId,
          question_id: questionId,
          created_at: new Date().toISOString(),
    })
}

// ===================== Bulk Sync from localStorage =====================

export async function syncAllFromLocalStorage(deviceId: string): Promise<{
    synced: { scores: number; mock: number; wrong: number }
    errors: string[]
}> {
    const errors: string[] = []
        let scoresSynced = 0
    let mockSynced = 0
    let wrongSynced = 0

  // Sync category scores
  try {
        const scoresStr = localStorage.getItem('sg-scores')
        if (scoresStr) {
                const scores = JSON.parse(scoresStr) as Record<string, { score: number; total: number; date: string }>
                for (const [key, val] of Object.entries(scores)) {
                          const parts = key.split('-')
                          const levelStr = parts.pop() || '1'
                          const category = parts.join('-')
                          const levelMap: Record<string, string> = { basic: '1', standard: '2', advanced: '3' }
                          const levelId = levelMap[levelStr] || levelStr

                  const result = await supabaseRequest('sg_quiz_results', 'POST', {
                              device_id: deviceId,
                              category_id: category,
                              level_id: levelId,
                              score: val.score,
                              total: val.total,
                              finished: true,
                              updated_at: val.date ? new Date(val.date).toISOString() : new Date().toISOString(),
                  })
                          if (result.error) errors.push(`score ${key}: ${result.error.message}`)
                          else scoresSynced++
                }
        }
  } catch (e) {
        errors.push(`scores: ${(e as Error).message}`)
  }

  // Sync mock exam best score
  try {
        const mockStr = localStorage.getItem('sg-mock-best')
        if (mockStr) {
                const mock = JSON.parse(mockStr) as { score: number; total: number; date: string }
                const result = await supabaseRequest('sg_mock_results', 'POST', {
                          device_id: deviceId,
                          score: mock.score,
                          total: mock.total,
                          created_at: mock.date ? new Date(mock.date).toISOString() : new Date().toISOString(),
                })
                if (result.error) errors.push(`mock: ${result.error.message}`)
                else mockSynced++
        }
  } catch (e) {
        errors.push(`mock: ${(e as Error).message}`)
  }

  // Sync wrong question IDs
  try {
        const wrongStr = localStorage.getItem('sg-wrong')
        if (wrongStr) {
                const wrongIds = JSON.parse(wrongStr) as number[]
                for (const qid of wrongIds) {
                          const result = await supabaseRequest('sg_wrong_answers', 'POST', {
                                      device_id: deviceId,
                                      question_id: qid,
                                      created_at: new Date().toISOString(),
                          })
                          if (result.error) errors.push(`wrong ${qid}: ${result.error.message}`)
                          else wrongSynced++
                }
        }
  } catch (e) {
        errors.push(`wrong: ${(e as Error).message}`)
  }

  return {
        synced: { scores: scoresSynced, mock: mockSynced, wrong: wrongSynced },
        errors,
  }
}

export function isSupabaseConfigured(): boolean {
    return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
}/**
 * Supabase Sync - SG Quiz App to CSJ Supabase DB
 */
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

async function sbPost(table: string, body: unknown): Promise<boolean> {
  if (!SB_URL || !SB_KEY) return false
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(body),
    })
    return r.ok
  } catch { return false }
}

export const syncQuizResult = (did: string, cat: string, lvl: string, score: number, total: number) =>
  sbPost('sg_quiz_results', { device_id: did, category_id: cat, level_id: lvl, score, total, finished: true, updated_at: new Date().toISOString() })

export const syncMockResult = (did: string, score: number, total: number) =>
  sbPost('sg_mock_results', { device_id: did, score, total, created_at: new Date().toISOString() })

export const syncWrongAnswer = (did: string, qid: number) =>
  sbPost('sg_wrong_answers', { device_id: did, question_id: qid, created_at: new Date().toISOString() })

export async function syncAllFromLocalStorage(did: string) {
  const errors: string[] = []; let synced = 0
  try {
    const ss = localStorage.getItem('sg-scores')
    if (ss) {
      const scores = JSON.parse(ss) as Record<string, {score:number,total:number}>
      for (const [k, v] of Object.entries(scores)) {
        const p = k.split('-'); const l = p.pop()||'1'; const c = p.join('-')
        const lm: Record<string,string> = {basic:'1',standard:'2',advanced:'3'}
        if (await syncQuizResult(did, c, lm[l]||l, v.score, v.total)) synced++
        else errors.push(k)
      }
    }
    const ms = localStorage.getItem('sg-mock-best')
    if (ms) {
      const m = JSON.parse(ms) as {score:number,total:number}
      if (await syncMockResult(did, m.score, m.total)) synced++
      else errors.push('mock')
    }
    const ws = localStorage.getItem('sg-wrong')
    if (ws) {
      const ids = JSON.parse(ws) as number[]
      for (const q of ids) {
        if (await syncWrongAnswer(did, q)) synced++
        else errors.push('w'+q)
      }
    }
  } catch(e) { errors.push((e as Error).message) }
  return { synced, errors }
}

export const isSupabaseConfigured = () => !!(SB_URL && SB_KEY)
