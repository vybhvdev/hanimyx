import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const hvId = req.nextUrl.searchParams.get("hvId");

  if (!slug && !hvId) {
    return NextResponse.json({ error: "missing identifier" }, { status: 400 });
  }

  try {
    const workerUrl = `https://hanime-worker.vaibhavyadav9988777.workers.dev/streams/${slug || hvId}`;
    const res = await fetch(workerUrl);

    if (!res.ok) {
      return NextResponse.json({ error: "upstream failed", status: res.status }, { status: 502 });
    }

    const streams = await res.json();

    if (!Array.isArray(streams) || streams.length === 0) {
      return NextResponse.json({ error: "no streams found" }, { status: 404 });
    }

    return NextResponse.json({ streams }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error("Stream fetch error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
