import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const hvId = req.nextUrl.searchParams.get("hvId");
  const slug = req.nextUrl.searchParams.get("slug");

  if (hvId && hvId !== "0") {
    const res = await fetch(`https://hanime-worker.vaibhavyadav9988777.workers.dev/streams-by-id/${hvId}`);
    if (!res.ok) return NextResponse.json({ error: "upstream failed", status: res.status }, { status: 502 });
    const json = await res.json();
    return NextResponse.json(json);
  }

  if (slug) {
    const res = await fetch(`https://hanime-worker.vaibhavyadav9988777.workers.dev/streams/${slug}`);
    if (!res.ok) return NextResponse.json({ error: "upstream failed", status: res.status }, { status: 502 });
    const streams = await res.json();
    return NextResponse.json({ streams });
  }

  return NextResponse.json({ error: "missing identifier" }, { status: 400 });
}
