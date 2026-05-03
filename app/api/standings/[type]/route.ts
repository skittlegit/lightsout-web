import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/api";
import { MOCK_CONSTRUCTORS, MOCK_DRIVERS } from "@/lib/mocks";

export const revalidate = 600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  if (type !== "drivers" && type !== "constructors") {
    return NextResponse.json({ error: "Unknown standings type" }, { status: 404 });
  }

  try {
    const res = await fetch(backendUrl(`/standings/${type}`), {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {
    // fall through to mock
  }

  return NextResponse.json(type === "drivers" ? MOCK_DRIVERS : MOCK_CONSTRUCTORS);
}
