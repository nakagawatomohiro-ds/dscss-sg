"use client";

import { useState, useRef, useEffect } from "react";
import { QuestionForClient, LEVEL_LABELS } from "@/lib/types";
import Spinner from "@/components/Spinner";

interface AnswerResult {
  isCorrect: boolean;
  correctDisplayIndex: number;
  explanation: string;
}

interface Props {
  question: QuestionForClient;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (questionId: number, chosenDisplayIndex: number) => Promise<AnswerResult>;
  onNext: () => void;
  isLast: boolean;
  alreadyAnswered: boolean;
}

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
  onNext,
  isLast,
  alreadyAnswered,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [result]);

  const handleSelect = async (displayIndex: number) => {
    if (result || loading || alreadyAnswered) return;
    setSelected(displayIndex);
    setLoading(true);
    try {
      const res = await onAnswer(question.questionId, displayIndex);
      setResult(res);
    } catch {
      alert("回答の送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setNextLoading(true);
    try {
      setSelected(null);
      setResult(null);
      await onNext();
    } finally {
      setNextLoading(false);
    }
  };

  const getChoiceStyle = (idx: number) => {
    const base =
      "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-sm md:text-base";

    if (!result) {
      if (selected === idx && loading)
        return `${base} border-emerald-600 bg-emerald-50 opacity-75`;
      if (selected === idx) return `${base} border-emerald-600 bg-emerald-50`;
      return `${base} border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 active:scale-[0.98]`;
    }

    if (idx === result.correctDisplayIndex) {
      return `${base} border-green-500 bg-green-50 font-semibold`;
    }
    if (idx === selected && !result.isCorrect) {
      return `${base} border-red-500 bg-red-50`;
    }
    return `${base} border-gray-200 opacity-50`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Category & Level badge */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
          {question.category}
        </span>
        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
          Lv.{question.level} {LEVEL_LABELS[question.level]}
        </span>
      </div>

      {/* Question number */}
      <p className="text-sm text-gray-500 mb-2">
        問 {currentIndex + 1} / {totalQuestions}
      </p>

      {/* Question text */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 mb-5">
        <p className="text-base md:text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
          {question.questionText}
        </p>
      </div>

      {/* Choices */}
      <div className="space-y-3 mb-5">
        {question.displayChoices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={!!result || loading || alreadyAnswered}
            className={getChoiceStyle(idx)}
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-sm font-bold mr-3 shrink-0">
              {selected === idx && loading ? (
                <Spinner size="sm" color="emerald" />
              ) : (
                ["A", "B", "C", "D"][idx]
              )}
            </span>
            <span>{choice}</span>
          </button>
        ))}
      </div>

      {/* Loading indicator while checking answer */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-3 text-emerald-600 text-sm">
          <Spinner size="sm" color="emerald" />
          <span>回答を確認中...</span>
        </div>
      )}

      {/* Result & Explanation */}
      {result && (
        <div
          ref={resultRef}
          className={`rounded-2xl p-5 mb-5 ${
            result.isCorrect
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p className="font-bold text-lg mb-2">
            {result.isCorrect ? "✅ 正解！" : "❌ 不正解"}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {result.explanation}
          </p>
        </div>
      )}

      {/* Next button - sticky on mobile for easy access */}
      {result && (
        <div className="sticky bottom-0 pb-4 pt-2 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent -mx-4 px-4">
          <button
            onClick={handleNext}
            disabled={nextLoading}
            className="w-full py-4 rounded-xl bg-emerald-700 text-white font-semibold text-lg hover:bg-emerald-800 transition-colors active:scale-[0.98] shadow-lg disabled:opacity-75"
          >
            {nextLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner size="sm" color="white" />
                <span>{isLast ? "結果を集計中..." : "次の問題を準備中..."}</span>
              </span>
            ) : (
              isLast ? "結果を見る" : "次の問題へ →"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
