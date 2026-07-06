import { NextResponse } from "next/server";
import { getCalendar } from "@/lib/api";

export const revalidate = 1800;

export async function GET() {
  return NextResponse.json(await getCalendar());
}
