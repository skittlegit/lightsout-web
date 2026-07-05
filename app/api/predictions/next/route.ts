import { NextResponse } from "next/server";
import { getNextPrediction } from "@/lib/api";

export const revalidate = 1800;
// Match the generous /predictions/next timeout in lib/api.ts so this proxy
// route isn't killed before a cold backend responds.
export const maxDuration = 30;

export async function GET() {
  return NextResponse.json(await getNextPrediction());
}
