"use client";

import { useState } from "react";
import { QuestionForClient, LEVEL_LABELS } from "@/lib/types";

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

  const handleNext = () => {
    setSelected(null);
    setResult(null);
    onNext();
  };

  const getChoiceStyle = (idx: number) => {
    const base = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-sm md:text-base";
    if (!result) {
      if (selected === idx) return `${base} border-emerald-600 bg-emerald-50`;
      return `${base} border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 active:scale-[0.98]`;
    }
    // After answer
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
              {["A", "B", "C", "D"][idx]}
            </span>
            <span>{choice}</span>
          </button>
        ))}
      </div>

      {/* Result & Explanation */}
      {result && (
        <div
          className={`rounded-2xl p-5 mb-5 ${
            result.isCorrect
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p className="font-bold text-lg mb-2">
            {result.isCorrect ? "✅ 正解！" : "❌ 不正解"}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{result.explanation}</p>
        </div>
      )}

      {/* Next button */}
      {result && (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-emerald-700 text-white font-semibold text-base hover:bg-emerald-800 transition-colors active:scale-[0.98]"
        >
          {isLast ? "結果を見る" : "次の問題へ →"}
        </button>
      )}
    </div>
  );
}
