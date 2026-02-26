import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const COOKIE_NAME = "sg_device_id";

export async function getOrCreateDeviceId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME);
  if (existing?.value) {
    return existing.value;
  }
  const newId = uuidv4();
  cookieStore.set(COOKIE_NAME, newId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
  });
  return newId;
}

export async function getDeviceId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}
