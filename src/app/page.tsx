"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, LEVEL_LABELS, LEVELS } from "@/lib/types";
import { LoadingScreen, ButtonSpinner } from "@/components/Spinner";

interface CategoryStat {
  category: string;
  level: number;
  total: number;
  answered: number;
  correct: number;
}

interface SummaryData {
  questionCount: number;
  categoryStats: CategoryStat[];
  wrongCount: number;
  recentAttempts: {
    id: string;
    mode: string;
    category: string | null;
    level: number | null;
    total_questions: number;
    correct_count: number;
    started_at: string;
    status: string;
  }[];
}

export default function Home() {
  const router = useRouter();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const init = useCallback(async () => {
    await fetch("/api/device/init", { method: "POST" });
    const res = await fetch("/api/summary");
    if (res.ok) {
      const data = await res.json();
      setSummary(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      alert(`シード完了: ${data.message} (${data.totalCount ?? data.count}問)`);
      window.location.reload();
    } catch {
      alert("シードに失敗しました");
    } finally {
      setSeeding(false);
    }
  };

  const startAttempt = async (mode: string, category?: string, level?: number) => {
    if (starting) return;
    const key = category ? `${mode}-${category}-${level}` : mode;
    setStarting(key);
    try {
      const body: Record<string, unknown> = { mode };
      if (category) body.category = category;
      if (level) body.level = level;
      const res = await fetch("/api/attempts/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "開始に失敗しました");
        return;
      }
      const { attemptId } = await res.json();
      router.push(`/quiz/${mode}?attemptId=${attemptId}`);
    } finally {
      setStarting(null);
    }
  };

  if (loading) {
    return <LoadingScreen message="データを読み込み中..." />;
  }

  const needsSeed = !summary || summary.questionCount === 0;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-900 to-green-950 text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            🛡️ 情報セキュリティマネジメント
          </h1>
          <p className="text-emerald-200 text-sm">学習アプリ — 全270問</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {needsSeed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
            <p className="text-yellow-800 mb-3 text-sm">
              問題データがまだありません。初回セットアップを実行してください。
            </p>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 disabled:opacity-50 transition-colors"
            >
              {seeding ? <ButtonSpinner label="セットアップ中..." /> : "🗄️ 初回セットアップ（270問登録）"}
            </button>
          </div>
        )}

        {!needsSeed && (
          <>
            {/* Mode: Mock exam */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                📝 模擬試験モード
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                全カテゴリからランダムに30問出題されます。
              </p>
              <button
                onClick={() => startAttempt("mock")}
                disabled={!!starting}
                className="w-full py-3 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-50 transition-colors"
              >
                {starting === "mock" ? <ButtonSpinner label="準備中..." /> : "模擬試験を開始"}
              </button>
            </section>

            {/* Mode: Wrong review */}
            {summary && summary.wrongCount > 0 && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  🔄 間違い復習モード
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  間違えた問題を復習します（{summary.wrongCount}問）
                </p>
                <button
                  onClick={() => startAttempt("wrong")}
                  disabled={!!starting}
                  className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {starting === "wrong" ? <ButtonSpinner label="準備中..." /> : "間違い復習を開始"}
                </button>
              </section>
            )}

            {/* Mode: Learn by category */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                📚 学習モード（カテゴリ別）
              </h2>
              <div className="space-y-4">
                {CATEGORIES.map((cat) => {
                  const stats =
                    summary?.categoryStats.filter(
                      (s: CategoryStat) => s.category === cat
                    ) ?? [];
                  return (
                    <div
                      key={cat}
                      className="border border-gray-100 rounded-xl p-4"
                    >
                      <h3 className="font-semibold text-sm mb-3 text-gray-800">
                        {cat}
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {LEVELS.map((lv) => {
                          const stat = stats.find(
                            (s: CategoryStat) => s.level === lv
                          );
                          const answered = stat?.answered ?? 0;
                          const correct = stat?.correct ?? 0;
                          const total = stat?.total ?? 10;
                          const pct =
                            answered > 0
                              ? Math.round((correct / answered) * 100)
                              : -1;
                          const key = `learn-${cat}-${lv}`;
                          const isStarting = starting === key;
                          return (
                            <button
                              key={lv}
                              onClick={() => startAttempt("learn", cat, lv)}
                              disabled={!!starting}
                              className={`p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-center disabled:opacity-50 ${isStarting ? "border-emerald-400 bg-emerald-50" : ""}`}
                            >
                              {isStarting ? (
                                <div className="flex flex-col items-center gap-1">
                                  <ButtonSpinner label="" spinnerColor="emerald" />
                                  <div className="text-[10px] text-emerald-600">準備中</div>
                                </div>
                              ) : (
                                <>
                                  <div className="text-xs text-gray-500 mb-1">
                                    Lv.{lv} {LEVEL_LABELS[lv]}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {pct >= 0 ? (
                                      <span
                                        className={
                                          pct >= 80
                                            ? "text-green-600"
                                            : pct >= 50
                                            ? "text-yellow-600"
                                            : "text-red-500"
                                        }
                                      >
                                        {correct}/{answered} ({pct}%)
                                      </span>
                                    ) : (
                                      <span>未挑戦</span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-gray-300 mt-1">
                                    {total}問
                                  </div>
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Recent attempts */}
            {summary && summary.recentAttempts.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  📊 最近の学習履歴
                </h2>
                <div className="space-y-2">
                  {summary.recentAttempts.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        if (a.status === "finished") {
                          router.push(`/result/${a.id}`);
                        }
                      }}
                    >
                      <div>
                        <span className="font-medium">
                          {a.mode === "mock"
                            ? "模擬試験"
                            : a.mode === "wrong"
                            ? "間違い復習"
                            : a.category ?? "学習"}
                        </span>
                        {a.level && (
                          <span className="ml-2 text-xs text-gray-500">
                            Lv.{a.level}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {a.status === "finished" ? (
                          <span className="text-emerald-700 font-semibold">
                            {a.correct_count}/{a.total_questions}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            {a.status === "in_progress" ? "進行中" : "中断"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
