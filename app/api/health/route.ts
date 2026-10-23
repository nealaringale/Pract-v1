import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "PaperLens AI",
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_API_KEY ? (process.env.GEMINI_MODEL || "gemini-2.5-flash") : null,
    mode: process.env.GEMINI_API_KEY ? "gemini" : "demo",
    timestamp: new Date().toISOString()
  });
}
