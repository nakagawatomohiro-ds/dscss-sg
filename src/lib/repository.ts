import { query } from "./db";
import { APP_KEY, QuestionRow, AttemptRow, AttemptQuestionRow, AttemptAnswerRow } from "./types";

/* ========== Questions ========== */
export async function getQuestionsByCategory(category: string, level: number): Promise<QuestionRow[]> {
  const rows = await query(
    `SELECT * FROM sg_questions WHERE app_key = $1 AND category = $2 AND level = $3 ORDER BY question_no`,
    [APP_KEY, category, level]
  );
  return rows as unknown as QuestionRow[];
}

export async function getAllQuestions(): Promise<QuestionRow[]> {
  const rows = await query(
    `SELECT * FROM sg_questions WHERE app_key = $1 ORDER BY category, level, question_no`,
    [APP_KEY]
  );
  return rows as unknown as QuestionRow[];
}

export async function getQuestionById(id: number): Promise<QuestionRow | null> {
  const rows = await query(
    `SELECT * FROM sg_questions WHERE id = $1`,
    [id]
  );
  return rows.length > 0 ? (rows[0] as unknown as QuestionRow) : null;
}

export async function getQuestionsByIds(ids: number[]): Promise<QuestionRow[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
  const rows = await query(
    `SELECT * FROM sg_questions WHERE id IN (${placeholders})`,
    ids
  );
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
  await query(
    `INSERT INTO sg_questions (app_key, category, level, question_no, question_text, choices, correct_index, explanation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (app_key, category, level, question_no)
     DO UPDATE SET question_text = $5, choices = $6, correct_index = $7, explanation = $8`,
    [APP_KEY, q.category, q.level, q.question_no, q.question_text, JSON.stringify(q.choices), q.correct_index, q.explanation]
  );
}

/* ========== Attempts ========== */
export async function createAttempt(data: {
  id: string;
  device_id: string;
  mode: string;
  category: string | null;
  level: number | null;
  total_questions: number;
}): Promise<void> {
  await query(
    `INSERT INTO attempts (id, app_key, device_id, mode, category, level, total_questions)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [data.id, APP_KEY, data.device_id, data.mode, data.category, data.level, data.total_questions]
  );
}

export async function getAttempt(attemptId: string): Promise<AttemptRow | null> {
  const rows = await query(
    `SELECT * FROM attempts WHERE id = $1`,
    [attemptId]
  );
  return rows.length > 0 ? (rows[0] as unknown as AttemptRow) : null;
}

export async function finishAttempt(attemptId: string, correctCount: number): Promise<void> {
  await query(
    `UPDATE attempts SET status = 'finished', correct_count = $2, finished_at = NOW() WHERE id = $1`,
    [attemptId, correctCount]
  );
}

export async function abandonAttempt(attemptId: string): Promise<void> {
  await query(
    `UPDATE attempts SET status = 'abandoned', finished_at = NOW() WHERE id = $1 AND status = 'in_progress'`,
    [attemptId]
  );
}

/* ========== Attempt Questions ========== */
export async function insertAttemptQuestions(questions: {
  attempt_id: string;
  question_id: number;
  display_order: number;
  choice_order: number[];
}[]): Promise<void> {
  for (const q of questions) {
    await query(
      `INSERT INTO attempt_questions (attempt_id, question_id, display_order, choice_order)
       VALUES ($1, $2, $3, $4)`,
      [q.attempt_id, q.question_id, q.display_order, JSON.stringify(q.choice_order)]
    );
  }
}

export async function getAttemptQuestions(attemptId: string): Promise<AttemptQuestionRow[]> {
  const rows = await query(
    `SELECT * FROM attempt_questions WHERE attempt_id = $1 ORDER BY display_order`,
    [attemptId]
  );
  return rows as unknown as AttemptQuestionRow[];
}

/* ========== Attempt Answers ========== */
export async function insertAttemptAnswer(data: {
  attempt_id: string;
  question_id: number;
  chosen_display_index: number;
  chosen_original_index: number;
  is_correct: boolean;
}): Promise<void> {
  await query(
    `INSERT INTO attempt_answers (attempt_id, question_id, chosen_display_index, chosen_original_index, is_correct)
     VALUES ($1, $2, $3, $4, $5)`,
    [data.attempt_id, data.question_id, data.chosen_display_index, data.chosen_original_index, data.is_correct]
  );
}

export async function getAttemptAnswers(attemptId: string): Promise<AttemptAnswerRow[]> {
  const rows = await query(
    `SELECT * FROM attempt_answers WHERE attempt_id = $1 ORDER BY answered_at`,
    [attemptId]
  );
  return rows as unknown as AttemptAnswerRow[];
}

/* ========== Wrong Questions ========== */
export async function upsertWrongQuestion(deviceId: string, questionId: number): Promise<void> {
  await query(
    `INSERT INTO wrong_questions (device_id, question_id, wrong_count, last_wrong_at, is_active)
     VALUES ($1, $2, 1, NOW(), TRUE)
     ON CONFLICT (device_id, question_id)
     DO UPDATE SET wrong_count = wrong_questions.wrong_count + 1, last_wrong_at = NOW(), is_active = TRUE, cleared_at = NULL`,
    [deviceId, questionId]
  );
}

export async function clearWrongQuestion(deviceId: string, questionId: number): Promise<void> {
  await query(
    `UPDATE wrong_questions SET is_active = FALSE, cleared_at = NOW()
     WHERE device_id = $1 AND question_id = $2`,
    [deviceId, questionId]
  );
}

export async function getActiveWrongQuestionIds(deviceId: string): Promise<number[]> {
  const rows = await query(
    `SELECT question_id FROM wrong_questions WHERE device_id = $1 AND is_active = TRUE ORDER BY last_wrong_at DESC`,
    [deviceId]
  );
  return rows.map((r) => r.question_id as number);
}

/* ========== Summary / Stats ========== */
export async function getCategoryStats(deviceId: string) {
  const rows = await query(
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
  const rows = await query(
    `SELECT id, mode, category, level, total_questions, correct_count, started_at, finished_at, status
     FROM attempts
     WHERE device_id = $1 AND app_key = $2
     ORDER BY started_at DESC
     LIMIT $3`,
    [deviceId, APP_KEY, limit]
  );
  return rows;
}

/* ========== Question count ========== */
export async function getQuestionCount(): Promise<number> {
  const rows = await query(
    `SELECT COUNT(*)::int AS cnt FROM sg_questions WHERE app_key = $1`,
    [APP_KEY]
  );
  return (rows[0] as unknown as { cnt: number }).cnt;
}
