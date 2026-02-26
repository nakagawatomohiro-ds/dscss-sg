"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import Progress from "@/components/Progress";
import Timer from "@/components/Timer";
import { QuestionForClient } from "@/lib/types";

interface AttemptData {
  attempt: {
    id: string;
    mode: string;
    category: string | null;
    level: number | null;
    status: string;
    totalQuestions: number;
    correctCount: number;
  };
  questions: QuestionForClient[];
  answeredQuestionIds: number[];
}

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");

  const [data, setData] = useState<AttemptData | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [timerRunning, setTimerRunning] = useState(true);

  const loadAttempt = useCallback(async () => {
    if (!attemptId) return;
    const res = await fetch(`/api/attempts/${attemptId}`);
    if (!res.ok) {
      alert("データの読み込みに失敗しました");
      router.push("/");
      return;
    }
    const d: AttemptData = await res.json();
    setData(d);
    setAnsweredIds(new Set(d.answeredQuestionIds));
    // Resume from last answered
    const nextIdx = d.answeredQuestionIds.length;
    setCurrentIdx(Math.min(nextIdx, d.questions.length - 1));
    setCorrectCount(d.attempt.correctCount);
    setLoading(false);
  }, [attemptId, router]);

  useEffect(() => {
    loadAttempt();
  }, [loadAttempt]);

  const handleAnswer = async (questionId: number, chosenDisplayIndex: number) => {
    const res = await fetch("/api/attempts/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId, questionId, chosenDisplayIndex }),
    });

    if (!res.ok) {
      throw new Error("Failed to submit answer");
    }

    const result = await res.json();
    setAnsweredIds((prev) => new Set([...Array.from(prev), questionId]));
    if (result.isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
    return result;
  };

  const handleNext = async () => {
    if (!data) return;
    const isLast = currentIdx >= data.questions.length - 1;

    if (isLast) {
      // Finish attempt
      setTimerRunning(false);
      const res = await fetch("/api/attempts/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });

      if (res.ok) {
        router.push(`/result/${attemptId}`);
      } else {
        alert("完了処理に失敗しました");
      }
      return;
    }

    setCurrentIdx((prev) => prev + 1);
  };

  const handleAbandon = async () => {
    if (!confirm("学習を中断しますか？")) return;
    setTimerRunning(false);
    await fetch("/api/attempts/abandon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId }),
    });
    router.push("/");
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400 text-lg">読み込み中...</div>
      </div>
    );
  }

  const currentQuestion = data.questions[currentIdx];
  const modeLabel =
    data.attempt.mode === "mock"
      ? "模擬試験"
      : data.attempt.mode === "wrong"
      ? "間違い復習"
      : `${data.attempt.category ?? ""}`;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleAbandon}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← 中断
          </button>
          <span className="text-sm font-semibold text-gray-700">{modeLabel}</span>
          <Timer isRunning={timerRunning} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Progress
          current={answeredIds.size}
          total={data.questions.length}
          correct={correctCount}
        />

        {currentQuestion && (
          <QuestionCard
            key={currentQuestion.questionId}
            question={currentQuestion}
            currentIndex={currentIdx}
            totalQuestions={data.questions.length}
            onAnswer={handleAnswer}
            onNext={handleNext}
            isLast={currentIdx >= data.questions.length - 1}
            alreadyAnswered={answeredIds.has(currentQuestion.questionId)}
          />
        )}
      </main>
    </div>
  );
}
