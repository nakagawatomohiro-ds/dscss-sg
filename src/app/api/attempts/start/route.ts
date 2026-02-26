import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { getDeviceId } from "@/lib/device";
import {
  createAttempt,
  insertAttemptQuestions,
  getQuestionsByCategory,
  getAllQuestions,
  getActiveWrongQuestionIds,
  getQuestionsByIds,
} from "@/lib/repository";
import { shuffleChoices } from "@/lib/shuffle";
import { CATEGORIES } from "@/lib/types";

const StartSchema = z.object({
  mode: z.enum(["learn", "mock", "wrong"]),
  category: z.string().optional(),
  level: z.number().min(1).max(3).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const deviceId = await getDeviceId();
    if (!deviceId) {
      return NextResponse.json({ error: "Device not initialized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = StartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { mode, category, level } = parsed.data;
    let questions;

    if (mode === "learn") {
      if (!category || !level) {
        return NextResponse.json({ error: "category and level required for learn mode" }, { status: 400 });
      }
      if (!CATEGORIES.includes(category as typeof CATEGORIES[number])) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      questions = await getQuestionsByCategory(category, level);
    } else if (mode === "mock") {
      const allQ = await getAllQuestions();
      // Shuffle and pick 30 for mock exam
      const shuffled = [...allQ].sort(() => Math.random() - 0.5);
      questions = shuffled.slice(0, 30);
    } else if (mode === "wrong") {
      const wrongIds = await getActiveWrongQuestionIds(deviceId);
      if (wrongIds.length === 0) {
        return NextResponse.json({ error: "No wrong questions to review" }, { status: 400 });
      }
      questions = await getQuestionsByIds(wrongIds);
      // Shuffle order
      questions = [...questions].sort(() => Math.random() - 0.5);
    } else {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    if (questions.length === 0) {
      return NextResponse.json({ error: "No questions found" }, { status: 404 });
    }

    const attemptId = uuidv4();

    await createAttempt({
      id: attemptId,
      device_id: deviceId,
      mode,
      category: mode === "learn" ? (category ?? null) : null,
      level: mode === "learn" ? (level ?? null) : null,
      total_questions: questions.length,
    });

    const attemptQuestions = questions.map((q, idx) => {
      const { choiceOrder } = shuffleChoices(q.choices);
      return {
        attempt_id: attemptId,
        question_id: q.id,
        display_order: idx + 1,
        choice_order: choiceOrder,
      };
    });

    await insertAttemptQuestions(attemptQuestions);

    return NextResponse.json({ attemptId, totalQuestions: questions.length });
  } catch (e) {
    console.error("attempts/start error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
