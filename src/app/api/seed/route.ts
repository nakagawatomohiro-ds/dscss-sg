import { NextResponse } from "next/server";
import { upsertQuestion, getQuestionCount } from "@/lib/repository";
import { sgQuestions } from "@/lib/sgCategories";

const USE_DB = !!process.env.DATABASE_URL;

export async function POST() {
  try {
    // Initialize schema only when DB is available
    if (USE_DB) {
      const { initializeSchema } = await import("@/lib/schema");
      await initializeSchema();
    }

    // Check if already seeded
    const count = await getQuestionCount();
    if (count >= 270) {
      return NextResponse.json({ message: "Already seeded", count });
    }

    // Seed questions
    let inserted = 0;
    for (const q of sgQuestions) {
      await upsertQuestion(q);
      inserted++;
    }

    const finalCount = await getQuestionCount();
    return NextResponse.json({ message: "Seed complete", inserted, totalCount: finalCount });
  } catch (e) {
    console.error("seed error:", e);
    return NextResponse.json({ error: "Seed failed", details: String(e) }, { status: 500 });
  }
}
