import { NextRequest, NextResponse } from "next/server";
import { fetchOptionChain } from "@/lib/ssvi/data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const ticker = (p.get("ticker") ?? "").trim().toUpperCase();
  if (!/^[A-Z.\-^]{1,10}$/.test(ticker)) {
    return NextResponse.json({ error: "Invalid ticker symbol" }, { status: 400 });
  }
  const isDate = (s: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const expiryStart = p.get("expiryStart");
  const expiryEnd = p.get("expiryEnd");
  if (!isDate(expiryStart) || !isDate(expiryEnd)) {
    return NextResponse.json({ error: "Invalid expiry range" }, { status: 400 });
  }

  try {
    const data = await fetchOptionChain({
      ticker,
      expiryStart: expiryStart!,
      expiryEnd: expiryEnd!,
      moneynessMin: Number(p.get("moneynessMin") ?? 0.8),
      moneynessMax: Number(p.get("moneynessMax") ?? 1.2),
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
