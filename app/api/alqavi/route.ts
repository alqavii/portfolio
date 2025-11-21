import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const filePath = join(process.cwd(), "data", "alqavi.md");
    const content = await readFile(filePath, "utf-8");
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load alqavi.md" },
      { status: 500 }
    );
  }
}

