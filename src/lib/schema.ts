import { query } from "./db";

export async function initializeSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS sg_questions (
      id SERIAL PRIMARY KEY,
      app_key VARCHAR(10) NOT NULL DEFAULT 'sg',
      category VARCHAR(100) NOT NULL,
      level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
      question_no INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      choices JSONB NOT NULL,
      correct_index INTEGER NOT NULL,
      explanation TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(app_key, category, level, question_no)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS attempts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      app_key VARCHAR(10) NOT NULL DEFAULT 'sg',
      device_id UUID NOT NULL,
      mode VARCHAR(20) NOT NULL CHECK (mode IN ('learn','mock','wrong')),
      category VARCHAR(100),
      level INTEGER,
      status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','finished','abandoned')),
      total_questions INTEGER NOT NULL DEFAULT 0,
      correct_count INTEGER NOT NULL DEFAULT 0,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      finished_at TIMESTAMPTZ
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS attempt_questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
      question_id INTEGER NOT NULL REFERENCES sg_questions(id),
      display_order INTEGER NOT NULL,
      choice_order JSONB NOT NULL,
      UNIQUE(attempt_id, question_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS attempt_answers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
      question_id INTEGER NOT NULL REFERENCES sg_questions(id),
      chosen_display_index INTEGER NOT NULL,
      chosen_original_index INTEGER NOT NULL,
      is_correct BOOLEAN NOT NULL,
      answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS wrong_questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      device_id UUID NOT NULL,
      question_id INTEGER NOT NULL REFERENCES sg_questions(id),
      wrong_count INTEGER NOT NULL DEFAULT 1,
      last_wrong_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      cleared_at TIMESTAMPTZ,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      UNIQUE(device_id, question_id)
    )
  `);

  // Indexes
  await query(`CREATE INDEX IF NOT EXISTS idx_attempts_device ON attempts(device_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_attempt_questions_attempt ON attempt_questions(attempt_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON attempt_answers(attempt_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_wrong_questions_device ON wrong_questions(device_id, is_active)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_sg_questions_cat_lv ON sg_questions(app_key, category, level)`);
}
