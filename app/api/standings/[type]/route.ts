import { NextResponse } from "next/server";
import { getConstructorStandings, getDriverStandings } from "@/lib/api";

export const revalidate = 600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  if (type === "drivers") {
    return NextResponse.json(await getDriverStandings());
  }
  if (type === "constructors") {
    return NextResponse.json(await getConstructorStandings());
  }
  return NextResponse.json({ error: "Unknown standings type" }, { status: 404 });
}
