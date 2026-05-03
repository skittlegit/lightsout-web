import { NextResponse } from "next/server";
import { getNextPrediction } from "@/lib/api";

export const revalidate = 1800;

export async function GET() {
  return NextResponse.json(await getNextPrediction());
}
