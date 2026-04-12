import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch("https://search.htv-services.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return NextResponse.json({ hits: [] }, { status: 502 });
  const data = await res.json();
  return NextResponse.json(data);
}
