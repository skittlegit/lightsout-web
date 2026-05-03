import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/api";
import { buildMockPredictions } from "@/lib/mocks";

export const revalidate = 1800;

export async function GET() {
  try {
    const res = await fetch(backendUrl("/predictions/next"), {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {
    // fall through to mock
  }
  return NextResponse.json(buildMockPredictions());
}
