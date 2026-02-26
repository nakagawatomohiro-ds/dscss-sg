import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDeviceId } from "@/lib/device";
import {
  getAttempt,
  getAttemptQuestions,
  getQuestionById,
  insertAttemptAnswer,
  upsertWrongQuestion,
  clearWrongQuestion,
} from "@/lib/repository";
import { getCorrectDisplayIndex } from "@/lib/shuffle";

const AnswerSchema = z.object({
  attemptId: z.string().uuid(),
  questionId: z.number().int().positive(),
  chosenDisplayIndex: z.number().int().min(0).max(3),
});

export async function POST(request: NextRequest) {
  try {
    const deviceId = await getDeviceId();
    if (!deviceId) {
      return NextResponse.json({ error: "Device not initialized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = AnswerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { attemptId, questionId, chosenDisplayIndex } = parsed.data;

    const attempt = await getAttempt(attemptId);
    if (!attempt || attempt.device_id !== deviceId) {
      return NextResponse.json({ error: "Attempt not found or unauthorized" }, { status: 404 });
    }
    if (attempt.status !== "in_progress") {
      return NextResponse.json({ error: "Attempt already finished" }, { status: 400 });
    }

    // Get the attempt question to find choice_order
    const aqRows = await getAttemptQuestions(attemptId);
    const aq = aqRows.find((r) => r.question_id === questionId);
    if (!aq) {
      return NextResponse.json({ error: "Question not in this attempt" }, { status: 400 });
    }

    const question = await getQuestionById(questionId);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const choiceOrder: number[] = typeof aq.choice_order === "string"
      ? JSON.parse(aq.choice_order)
      : aq.choice_order;

    // Map display index to original index
    const chosenOriginalIndex = choiceOrder[chosenDisplayIndex];
    const isCorrect = chosenOriginalIndex === question.correct_index;
    const correctDisplayIndex = getCorrectDisplayIndex(choiceOrder, question.correct_index);

    await insertAttemptAnswer({
      attempt_id: attemptId,
      question_id: questionId,
      chosen_display_index: chosenDisplayIndex,
      chosen_original_index: chosenOriginalIndex,
      is_correct: isCorrect,
    });

    // Update wrong_questions
    if (isCorrect) {
      await clearWrongQuestion(deviceId, questionId);
    } else {
      await upsertWrongQuestion(deviceId, questionId);
    }

    return NextResponse.json({
      isCorrect,
      correctDisplayIndex,
      explanation: question.explanation,
    });
  } catch (e) {
    console.error("attempts/answer error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
