import { readFile } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

// Editor file id -> markdown file under data/
const FILES: Record<string, string> = {
  "alqavi.md": "alqavi.md",
  "projects/petral/README.md": "readmes/petral.md",
  "projects/qtc-quant/README.md": "readmes/qtc-quant.md",
  "projects/ssvi-surface/README.md": "readmes/ssvi-surface.md",
};

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get("file") ?? "";
  const source = FILES[file];
  if (!source) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const content = await readFile(join(process.cwd(), "data", source), "utf-8");
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: `Failed to load ${file}` }, { status: 500 });
  }
}
