"use client";

interface Props {
  current: number;
  total: number;
  correct: number;
}

export default function Progress({ current, total, correct }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const correctPct = current > 0 ? Math.round((correct / current) * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>進捗: {current}/{total}</span>
        <span>正答率: {current > 0 ? `${correctPct}%` : "—"}</span>
      </div>
    </div>
  );
}
