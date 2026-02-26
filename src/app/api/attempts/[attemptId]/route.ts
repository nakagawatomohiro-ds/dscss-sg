import { NextRequest, NextResponse } from "next/server";
import { getDeviceId } from "@/lib/device";
import { getAttempt, getAttemptQuestions, getAttemptAnswers, getQuestionsByIds } from "@/lib/repository";
import { QuestionForClient } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const deviceId = await getDeviceId();
    if (!deviceId) {
      return NextResponse.json({ error: "Device not initialized" }, { status: 401 });
    }

    const { attemptId } = await params;
    const attempt = await getAttempt(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }
    if (attempt.device_id !== deviceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [aqRows, answerRows] = await Promise.all([
      getAttemptQuestions(attemptId),
      getAttemptAnswers(attemptId),
    ]);

    const questionIds = aqRows.map((aq) => aq.question_id);
    const questions = await getQuestionsByIds(questionIds);
    const qMap = new Map(questions.map((q) => [q.id, q]));

    // Build client-safe questions (NO correct_index!)
    const clientQuestions: QuestionForClient[] = aqRows.map((aq) => {
      const q = qMap.get(aq.question_id)!;
      const choiceOrder: number[] = typeof aq.choice_order === "string"
        ? JSON.parse(aq.choice_order)
        : aq.choice_order;
      const displayChoices = choiceOrder.map((oi: number) => q.choices[oi]);
      return {
        questionId: q.id,
        displayOrder: aq.display_order,
        questionText: q.question_text,
        displayChoices,
        category: q.category,
        level: q.level,
      };
    });

    // Answered question IDs
    const answeredIds = new Set(answerRows.map((a) => a.question_id));

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        mode: attempt.mode,
        category: attempt.category,
        level: attempt.level,
        status: attempt.status,
        totalQuestions: attempt.total_questions,
        correctCount: attempt.correct_count,
        startedAt: attempt.started_at,
        finishedAt: attempt.finished_at,
      },
      questions: clientQuestions,
      answeredQuestionIds: Array.from(answeredIds),
    });
  } catch (e) {
    console.error("attempts/[attemptId] error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
