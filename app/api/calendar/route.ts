import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/api";
import { MOCK_CALENDAR } from "@/lib/mocks";

export const revalidate = 86400;

export async function GET() {
  try {
    const res = await fetch(backendUrl("/calendar"), {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {
    // fall through to mock
  }
  return NextResponse.json(MOCK_CALENDAR);
}
