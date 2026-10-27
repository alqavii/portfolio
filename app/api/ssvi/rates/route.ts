import { NextResponse } from "next/server";
import { fetchZeroRates } from "@/lib/ssvi/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { curve, parYields } = await fetchZeroRates();
    return NextResponse.json({ zeroCurve: curve, parYields });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
