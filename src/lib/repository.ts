/* eslint-disable @typescript-eslint/no-explicit-any */
import { APP_KEY, QuestionRow, AttemptRow, AttemptQuestionRow, AttemptAnswerRow } from "./types";
import { sgQuestions } from "./sgCategories";

const USE_DB = !!process.env.DATABASE_URL;

// ===================== In-memory store =====================
// Holds all state when DATABASE_URL is not configured.
// Data lives only for the lifetime of the serverless function (or dev server).
// This is fine for UI/UX previewing & Vercel demo deployment.

let _questions: QuestionRow[] = [];
const _attempts = new Map<string, AttemptRow>();
const _attemptQuestions = new Map<string, AttemptQuestionRow[]>();
const _attemptAnswers = new Map<string, AttemptAnswerRow[]>();
const _wrongQuestions = new Map<string, Map<number, { wrong_count: number; is_active: boolean; last_wrong_at: string }>>();

function _initQuestions() {
  if (_questions.length > 0) return;
  _questions = sgQuestions.map((q, idx) => ({
    id: idx + 1,
    app_key: APP_KEY,
    category: q.category,
    level: q.level,
    question_no: q.question_no,
    question_text: q.question_text,
    choices: typeof q.choices === "string" ? JSON.parse(q.choices) : q.choices,
    correct_index: q.correct_index,
    explanation: q.explanation,
    created_at: new Date().toISOString(),
  }));
}

// ===================== DB helpers (lazy import) =====================
let _query: ((text: string, params?: unknown[]) => Promise<any[]>) | null = null;
async function dbQuery(text: string, params?: unknown[]): Promise<any[]> {
  if (!_query) {
    const mod = await import("./db");
    _query = mod.query;
  }
  return _query(text, params ?? []);
}

// ===================== Questions =====================
export async function getQuestionsByCategory(category: string, level: number): Promise<QuestionRow[]> {
  if (!USE_DB) {
    _initQuestions();
    return _questions.filter((q) => q.category === category && q.level === level);
  }
  const rows = await dbQuery(
    `SELECT * FROM sg_questions WHERE app_key = $1 AND category = $2 AND level = $3 ORDER BY question_no`,
    [APP_KEY, category, level]
  );
  return rows as unknown as QuestionRow[];
}

export async function getAllQuestions(): Promise<QuestionRow[]> {
  if (!USE_DB) {
    _initQuestions();
    return [..._questions];
  }
  const rows = await dbQuery(
    `SELECT * FROM sg_questions WHERE app_key = $1 ORDER BY category, level, question_no`,
    [APP_KEY]
  );
  return rows as unknown as QuestionRow[];
}

export async function getQuestionById(id: number): Promise<QuestionRow | null> {
  if (!USE_DB) {
    _initQuestions();
    return _questions.find((q) => q.id === id) ?? null;
  }
  const rows = await dbQuery(`SELECT * FROM sg_questions WHERE id = $1`, [id]);
  return rows.length > 0 ? (rows[0] as unknown as QuestionRow) : null;
}

export async function getQuestionsByIds(ids: number[]): Promise<QuestionRow[]> {
  if (ids.length === 0) return [];
  if (!USE_DB) {
    _initQuestions();
    const idSet = new Set(ids);
    return _questions.filter((q) => idSet.has(q.id));
  }
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
  const rows = await dbQuery(`SELECT * FROM sg_questions WHERE id IN (${placeholders})`, ids);
  return rows as unknown as QuestionRow[];
}

export async function upsertQuestion(q: {
  category: string;
  level: number;
  question_no: number;
  question_text: string;
  choices: string[];
  correct_index: number;
  explanation: string;
}): Promise<void> {
  if (!USE_DB) {
    _initQuestions();
    return; // already loaded from sgQuestions
  }
  await dbQuery(
    `INSERT INTO sg_questions (app_key, category, level, question_no, question_text, choices, correct_index, explanation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (app_key, category, level, question_no)
     DO UPDATE SET question_text = $5, choices = $6, correct_index = $7, explanation = $8`,
    [APP_KEY, q.category, q.level, q.question_no, q.question_text, JSON.stringify(q.choices), q.correct_index, q.explanation]
  );
}

// ===================== Attempts =====================
export async function createAttempt(data: {
  id: string;
  device_id: string;
  mode: string;
  category: string | null;
  level: number | null;
  total_questions: number;
}): Promise<void> {
  if (!USE_DB) {
    _attempts.set(data.id, {
      id: data.id,
      app_key: APP_KEY,
      device_id: data.device_id,
      mode: data.mode,
      category: data.category,
      level: data.level,
      status: "in_progress",
      total_questions: data.total_questions,
      correct_count: 0,
      started_at: new Date().toISOString(),
      finished_at: null,
    });
    return;
  }
  await dbQuery(
    `INSERT INTO attempts (id, app_key, device_id, mode, category, level, total_questions)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [data.id, APP_KEY, data.device_id, data.mode, data.category, data.level, data.total_questions]
  );
}

export async function getAttempt(attemptId: string): Promise<AttemptRow | null> {
  if (!USE_DB) {
    return _attempts.get(attemptId) ?? null;
  }
  const rows = await dbQuery(`SELECT * FROM attempts WHERE id = $1`, [attemptId]);
  return rows.length > 0 ? (rows[0] as unknown as AttemptRow) : null;
}

export async function finishAttempt(attemptId: string, correctCount: number): Promise<void> {
  if (!USE_DB) {
    const a = _attempts.get(attemptId);
    if (a) {
      a.status = "finished";
      a.correct_count = correctCount;
      a.finished_at = new Date().toISOString();
    }
    return;
  }
  await dbQuery(
    `UPDATE attempts SET status = 'finished', correct_count = $2, finished_at = NOW() WHERE id = $1`,
    [attemptId, correctCount]
  );
}

export async function abandonAttempt(attemptId: string): Promise<void> {
  if (!USE_DB) {
    const a = _attempts.get(attemptId);
    if (a && a.status === "in_progress") {
      a.status = "abandoned";
      a.finished_at = new Date().toISOString();
    }
    return;
  }
  await dbQuery(
    `UPDATE attempts SET status = 'abandoned', finished_at = NOW() WHERE id = $1 AND status = 'in_progress'`,
    [attemptId]
  );
}

// ===================== Attempt Questions =====================
export async function insertAttemptQuestions(questions: {
  attempt_id: string;
  question_id: number;
  display_order: number;
  choice_order: number[];
}[]): Promise<void> {
  if (!USE_DB) {
    const rows: AttemptQuestionRow[] = questions.map((q) => ({
      id: crypto.randomUUID(),
      attempt_id: q.attempt_id,
      question_id: q.question_id,
      display_order: q.display_order,
      choice_order: q.choice_order,
    }));
    const existing = _attemptQuestions.get(questions[0]?.attempt_id) ?? [];
    _attemptQuestions.set(questions[0]?.attempt_id, [...existing, ...rows]);
    return;
  }
  for (const q of questions) {
    await dbQuery(
      `INSERT INTO attempt_questions (attempt_id, question_id, display_order, choice_order)
       VALUES ($1, $2, $3, $4)`,
      [q.attempt_id, q.question_id, q.display_order, JSON.stringify(q.choice_order)]
    );
  }
}

export async function getAttemptQuestions(attemptId: string): Promise<AttemptQuestionRow[]> {
  if (!USE_DB) {
    return (_attemptQuestions.get(attemptId) ?? []).sort((a, b) => a.display_order - b.display_order);
  }
  const rows = await dbQuery(
    `SELECT * FROM attempt_questions WHERE attempt_id = $1 ORDER BY display_order`,
    [attemptId]
  );
  return rows as unknown as AttemptQuestionRow[];
}

// ===================== Attempt Answers =====================
export async function insertAttemptAnswer(data: {
  attempt_id: string;
  question_id: number;
  chosen_display_index: number;
  chosen_original_index: number;
  is_correct: boolean;
}): Promise<void> {
  if (!USE_DB) {
    const row: AttemptAnswerRow = {
      id: crypto.randomUUID(),
      attempt_id: data.attempt_id,
      question_id: data.question_id,
      chosen_display_index: data.chosen_display_index,
      chosen_original_index: data.chosen_original_index,
      is_correct: data.is_correct,
      answered_at: new Date().toISOString(),
    };
    const existing = _attemptAnswers.get(data.attempt_id) ?? [];
    existing.push(row);
    _attemptAnswers.set(data.attempt_id, existing);
    return;
  }
  await dbQuery(
    `INSERT INTO attempt_answers (attempt_id, question_id, chosen_display_index, chosen_original_index, is_correct)
     VALUES ($1, $2, $3, $4, $5)`,
    [data.attempt_id, data.question_id, data.chosen_display_index, data.chosen_original_index, data.is_correct]
  );
}

export async function getAttemptAnswers(attemptId: string): Promise<AttemptAnswerRow[]> {
  if (!USE_DB) {
    return (_attemptAnswers.get(attemptId) ?? []).sort(
      (a, b) => new Date(a.answered_at).getTime() - new Date(b.answered_at).getTime()
    );
  }
  const rows = await dbQuery(
    `SELECT * FROM attempt_answers WHERE attempt_id = $1 ORDER BY answered_at`,
    [attemptId]
  );
  return rows as unknown as AttemptAnswerRow[];
}

// ===================== Wrong Questions =====================
export async function upsertWrongQuestion(deviceId: string, questionId: number): Promise<void> {
  if (!USE_DB) {
    if (!_wrongQuestions.has(deviceId)) _wrongQuestions.set(deviceId, new Map());
    const map = _wrongQuestions.get(deviceId)!;
    const existing = map.get(questionId);
    if (existing) {
      existing.wrong_count += 1;
      existing.is_active = true;
      existing.last_wrong_at = new Date().toISOString();
    } else {
      map.set(questionId, { wrong_count: 1, is_active: true, last_wrong_at: new Date().toISOString() });
    }
    return;
  }
  await dbQuery(
    `INSERT INTO wrong_questions (device_id, question_id, wrong_count, last_wrong_at, is_active)
     VALUES ($1, $2, 1, NOW(), TRUE)
     ON CONFLICT (device_id, question_id)
     DO UPDATE SET wrong_count = wrong_questions.wrong_count + 1, last_wrong_at = NOW(), is_active = TRUE, cleared_at = NULL`,
    [deviceId, questionId]
  );
}

export async function clearWrongQuestion(deviceId: string, questionId: number): Promise<void> {
  if (!USE_DB) {
    const map = _wrongQuestions.get(deviceId);
    if (map) {
      const existing = map.get(questionId);
      if (existing) {
        existing.is_active = false;
      }
    }
    return;
  }
  await dbQuery(
    `UPDATE wrong_questions SET is_active = FALSE, cleared_at = NOW()
     WHERE device_id = $1 AND question_id = $2`,
    [deviceId, questionId]
  );
}

export async function getActiveWrongQuestionIds(deviceId: string): Promise<number[]> {
  if (!USE_DB) {
    const map = _wrongQuestions.get(deviceId);
    if (!map) return [];
    const entries = Array.from(map.entries());
    return entries
      .filter(([, v]) => v.is_active)
      .sort((a, b) => new Date(b[1].last_wrong_at).getTime() - new Date(a[1].last_wrong_at).getTime())
      .map(([k]) => k);
  }
  const rows = await dbQuery(
    `SELECT question_id FROM wrong_questions WHERE device_id = $1 AND is_active = TRUE ORDER BY last_wrong_at DESC`,
    [deviceId]
  );
  return rows.map((r) => r.question_id as number);
}

// ===================== Summary / Stats =====================
export async function getCategoryStats(deviceId: string) {
  if (!USE_DB) {
    _initQuestions();
    // Build stats from in-memory data
    const statsMap = new Map<string, { category: string; level: number; total: number; answered: number; correct: number }>();
    for (const q of _questions) {
      const key = `${q.category}|${q.level}`;
      if (!statsMap.has(key)) {
        statsMap.set(key, { category: q.category, level: q.level, total: 0, answered: 0, correct: 0 });
      }
      statsMap.get(key)!.total++;
    }
    // Count answers from finished attempts for this device
    for (const [attemptId, attempt] of Array.from(_attempts.entries())) {
      if (attempt.device_id !== deviceId || attempt.status !== "finished") continue;
      const answers = _attemptAnswers.get(attemptId) ?? [];
      for (const ans of answers) {
        const q = _questions.find((qq) => qq.id === ans.question_id);
        if (!q) continue;
        const key = `${q.category}|${q.level}`;
        const stat = statsMap.get(key);
        if (stat) {
          stat.answered++;
          if (ans.is_correct) stat.correct++;
        }
      }
    }
    const statsArray = Array.from(statsMap.values());
    return statsArray.sort((a, b) =>
      a.category === b.category ? a.level - b.level : a.category.localeCompare(b.category)
    );
  }
  const rows = await dbQuery(
    `SELECT
       q.category,
       q.level,
       COUNT(DISTINCT q.id)::int AS total,
       COUNT(DISTINCT aa.question_id)::int AS answered,
       COUNT(DISTINCT CASE WHEN aa.is_correct THEN aa.question_id END)::int AS correct
     FROM sg_questions q
     LEFT JOIN attempt_questions aq ON aq.question_id = q.id
     LEFT JOIN attempts a ON a.id = aq.attempt_id AND a.device_id = $1 AND a.status = 'finished'
     LEFT JOIN attempt_answers aa ON aa.attempt_id = a.id AND aa.question_id = q.id
     WHERE q.app_key = $2
     GROUP BY q.category, q.level
     ORDER BY q.category, q.level`,
    [deviceId, APP_KEY]
  );
  return rows;
}

export async function getRecentAttempts(deviceId: string, limit: number = 10) {
  if (!USE_DB) {
    const allAttempts = Array.from(_attempts.values());
    return allAttempts
      .filter((a) => a.device_id === deviceId)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, limit)
      .map((a) => ({
        id: a.id,
        mode: a.mode,
        category: a.category,
        level: a.level,
        total_questions: a.total_questions,
        correct_count: a.correct_count,
        started_at: a.started_at,
        finished_at: a.finished_at,
        status: a.status,
      }));
  }
  const rows = await dbQuery(
    `SELECT id, mode, category, level, total_questions, correct_count, started_at, finished_at, status
     FROM attempts
     WHERE device_id = $1 AND app_key = $2
     ORDER BY started_at DESC
     LIMIT $3`,
    [deviceId, APP_KEY, limit]
  );
  return rows;
}

// ===================== Question count =====================
export async function getQuestionCount(): Promise<number> {
  if (!USE_DB) {
    _initQuestions();
    return _questions.length;
  }
  const rows = await dbQuery(
    `SELECT COUNT(*)::int AS cnt FROM sg_questions WHERE app_key = $1`,
    [APP_KEY]
  );
  return (rows[0] as unknown as { cnt: number }).cnt;
}
