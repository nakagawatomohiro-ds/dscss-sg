"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { LEVEL_LABELS } from "@/lib/types";

interface AttemptResult {
  attempt: {
    id: string;
    mode: string;
    category: string | null;
    level: number | null;
    status: string;
    totalQuestions: number;
    correctCount: number;
    startedAt: string;
    finishedAt: string | null;
  };
  questions: {
    questionId: number;
    displayOrder: number;
    questionText: string;
    displayChoices: string[];
    category: string;
    level: number;
  }[];
  answeredQuestionIds: number[];
}

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;
  const [data, setData] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/attempts/${attemptId}`);
    if (!res.ok) {
      router.push("/");
      return;
    }
    const d = await res.json();
    setData(d);
    setLoading(false);
  }, [attemptId, router]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400 text-lg">読み込み中...</div>
      </div>
    );
  }

  const { attempt } = data;
  const score = attempt.totalQuestions > 0
    ? Math.round((attempt.correctCount / attempt.totalQuestions) * 100)
    : 0;

  const modeLabel =
    attempt.mode === "mock"
      ? "模擬試験"
      : attempt.mode === "wrong"
      ? "間違い復習"
      : attempt.category ?? "学習";

  const getScoreColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-500";
  };

  const getScoreEmoji = () => {
    if (score >= 90) return "🎉";
    if (score >= 80) return "👏";
    if (score >= 60) return "💪";
    return "📖";
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-blue-200 text-sm mb-2">{modeLabel}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">学習結果</h1>
          {attempt.level && (
            <p className="text-blue-200 text-sm">Lv.{attempt.level} {LEVEL_LABELS[attempt.level]}</p>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Score Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-5xl mb-3">{getScoreEmoji()}</div>
          <div className={`text-5xl font-bold mb-2 ${getScoreColor()}`}>
            {score}%
          </div>
          <p className="text-gray-500 text-sm">
            {attempt.correctCount} / {attempt.totalQuestions} 問正解
          </p>

          {/* Score bar */}
          <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>

          {score >= 80 && (
            <p className="mt-3 text-green-600 text-sm font-medium">
              素晴らしい！合格ラインを超えています！
            </p>
          )}
          {score >= 60 && score < 80 && (
            <p className="mt-3 text-yellow-600 text-sm font-medium">
              もう少し！復習して合格ラインを目指しましょう！
            </p>
          )}
          {score < 60 && (
            <p className="mt-3 text-red-500 text-sm font-medium">
              基礎から復習しましょう。間違い復習モードを活用してください。
            </p>
          )}
        </section>

        {/* Summary */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-bold mb-3">詳細</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-gray-500 mb-1">出題数</div>
              <div className="text-xl font-bold">{attempt.totalQuestions}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-gray-500 mb-1">正答数</div>
              <div className="text-xl font-bold text-green-600">{attempt.correctCount}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-gray-500 mb-1">不正解数</div>
              <div className="text-xl font-bold text-red-500">
                {attempt.totalQuestions - attempt.correctCount}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-gray-500 mb-1">正答率</div>
              <div className={`text-xl font-bold ${getScoreColor()}`}>{score}%</div>
            </div>
          </div>
        </section>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            🏠 トップに戻る
          </button>
          {attempt.totalQuestions - attempt.correctCount > 0 && (
            <button
              onClick={async () => {
                const res = await fetch("/api/attempts/start", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ mode: "wrong" }),
                });
                if (res.ok) {
                  const { attemptId: newId } = await res.json();
                  router.push(`/quiz/wrong?attemptId=${newId}`);
                }
              }}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
            >
              🔄 間違い復習を開始
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
