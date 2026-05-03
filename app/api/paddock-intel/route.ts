import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/api";
import { buildMockIntel } from "@/lib/mocks";

export const revalidate = 1800;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const roundParam = url.searchParams.get("round");
  const round = roundParam ? Number(roundParam) : 3;

  try {
    const res = await fetch(backendUrl(`/paddock-intel?round=${round}`), {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {
    // fall through to mock
  }

  return NextResponse.json(buildMockIntel(round) ?? buildMockIntel(3));
}
