import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDeviceId } from "@/lib/device";
import { getAttempt, abandonAttempt } from "@/lib/repository";

const AbandonSchema = z.object({
  attemptId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const deviceId = await getDeviceId();
    if (!deviceId) {
      return NextResponse.json({ error: "Device not initialized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = AbandonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { attemptId } = parsed.data;
    const attempt = await getAttempt(attemptId);
    if (!attempt || attempt.device_id !== deviceId) {
      return NextResponse.json({ error: "Attempt not found or unauthorized" }, { status: 404 });
    }

    await abandonAttempt(attemptId);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("attempts/abandon error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
