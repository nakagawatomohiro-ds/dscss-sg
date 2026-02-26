import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDeviceId } from "@/lib/device";
import { getAttempt, getAttemptAnswers, finishAttempt } from "@/lib/repository";

const FinishSchema = z.object({
  attemptId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const deviceId = await getDeviceId();
    if (!deviceId) {
      return NextResponse.json({ error: "Device not initialized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = FinishSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { attemptId } = parsed.data;
    const attempt = await getAttempt(attemptId);
    if (!attempt || attempt.device_id !== deviceId) {
      return NextResponse.json({ error: "Attempt not found or unauthorized" }, { status: 404 });
    }
    if (attempt.status !== "in_progress") {
      return NextResponse.json({ error: "Attempt already finished" }, { status: 400 });
    }

    const answers = await getAttemptAnswers(attemptId);
    const correctCount = answers.filter((a) => a.is_correct).length;

    await finishAttempt(attemptId, correctCount);

    return NextResponse.json({
      attemptId,
      totalQuestions: attempt.total_questions,
      correctCount,
      score: Math.round((correctCount / attempt.total_questions) * 100),
    });
  } catch (e) {
    console.error("attempts/finish error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
