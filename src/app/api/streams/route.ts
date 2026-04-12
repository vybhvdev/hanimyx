import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const hvId = req.nextUrl.searchParams.get("hvId");
  if (!hvId || hvId === "0") return NextResponse.json({ error: "missing hvId" }, { status: 400 });

  const res = await fetch(`https://hanime-worker.vaibhavyadav9988777.workers.dev/streams-by-id/${hvId}`);
  if (!res.ok) return NextResponse.json({ error: "upstream failed", status: res.status }, { status: 502 });
  const json = await res.json();
  return NextResponse.json(json);
}
