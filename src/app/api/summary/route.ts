import { NextResponse } from "next/server";
import { getDeviceId } from "@/lib/device";
import { getCategoryStats, getRecentAttempts, getActiveWrongQuestionIds, getQuestionCount } from "@/lib/repository";

export async function GET() {
  try {
    const deviceId = await getDeviceId();
    if (!deviceId) {
      return NextResponse.json({ error: "Device not initialized" }, { status: 401 });
    }

    const [categoryStats, recentAttempts, wrongIds, questionCount] = await Promise.all([
      getCategoryStats(deviceId),
      getRecentAttempts(deviceId),
      getActiveWrongQuestionIds(deviceId),
      getQuestionCount(),
    ]);

    return NextResponse.json({
      questionCount,
      categoryStats,
      recentAttempts,
      wrongCount: wrongIds.length,
    });
  } catch (e) {
    console.error("summary error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
