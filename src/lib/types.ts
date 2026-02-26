/* ========== DB row types ========== */
export interface QuestionRow {
  id: number;
  app_key: string;
  category: string;
  level: number;
  question_no: number;
  question_text: string;
  choices: string[];
  correct_index: number;
  explanation: string;
  created_at: string;
}

export interface AttemptRow {
  id: string;
  app_key: string;
  device_id: string;
  mode: string;
  category: string | null;
  level: number | null;
  status: string;
  total_questions: number;
  correct_count: number;
  started_at: string;
  finished_at: string | null;
}

export interface AttemptQuestionRow {
  id: string;
  attempt_id: string;
  question_id: number;
  display_order: number;
  choice_order: number[];
}

export interface AttemptAnswerRow {
  id: string;
  attempt_id: string;
  question_id: number;
  chosen_display_index: number;
  chosen_original_index: number;
  is_correct: boolean;
  answered_at: string;
}

export interface WrongQuestionRow {
  id: string;
  device_id: string;
  question_id: number;
  wrong_count: number;
  last_wrong_at: string;
  cleared_at: string | null;
  is_active: boolean;
}

/* ========== API response types ========== */
export interface QuestionForClient {
  questionId: number;
  displayOrder: number;
  questionText: string;
  displayChoices: string[];  // shuffled
  category: string;
  level: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctDisplayIndex: number;
  explanation: string;
}

export interface CategoryStat {
  category: string;
  level: number;
  total: number;
  answered: number;
  correct: number;
}

export interface AttemptSummary {
  attemptId: string;
  mode: string;
  category: string | null;
  level: number | null;
  totalQuestions: number;
  correctCount: number;
  startedAt: string;
  finishedAt: string | null;
}

/* ========== Constants ========== */
export const APP_KEY = "sg";

export const CATEGORIES = [
  "情報セキュリティの基礎",
  "情報セキュリティ関連法規",
  "情報セキュリティ管理",
  "リスクマネジメント",
  "情報セキュリティ対策（技術）",
  "情報セキュリティ対策（人的・組織的）",
  "ネットワークとセキュリティ",
  "インシデント対応と事業継続",
  "テクノロジ系基礎（システム・DB等）",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const LEVELS = [1, 2, 3] as const;
export const LEVEL_LABELS: Record<number, string> = {
  1: "基礎",
  2: "応用",
  3: "実践",
};

export type Mode = "learn" | "mock" | "wrong";
