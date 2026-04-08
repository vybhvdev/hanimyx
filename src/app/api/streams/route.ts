import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const hvId = req.nextUrl.searchParams.get("hvId");
  if (!hvId) return NextResponse.json({ error: "missing hvId" }, { status: 400 });

  const res = await fetch(`https://cached.freeanimehentai.net/api/v8/guest/videos/${hvId}/manifest`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "Accept": "application/json",
      "Referer": "https://hanime.tv/",
      "Origin": "https://hanime.tv",
    },
  });

  if (!res.ok) return NextResponse.json({ error: "upstream failed", status: res.status }, { status: 502 });
  const json = await res.json();
  const streams = (json?.videos_manifest?.servers ?? [])
    .flatMap((s: any) => s.streams)
    .filter((st: any) => st.kind !== "premium_alert" && st.url);

  return NextResponse.json({ streams });
}
