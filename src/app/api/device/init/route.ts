import { NextResponse } from "next/server";
import { getOrCreateDeviceId } from "@/lib/device";

export async function POST() {
  try {
    const deviceId = await getOrCreateDeviceId();
    return NextResponse.json({ deviceId });
  } catch (e) {
    console.error("device/init error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
