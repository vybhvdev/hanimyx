import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { HANIME_SECRET } from "@/lib/providers/hanime";

export async function GET(req: NextRequest) {
  const hvId = req.nextUrl.searchParams.get("hvId");
  const slug = req.nextUrl.searchParams.get("slug");
  
  if (!hvId && !slug) {
    return NextResponse.json({ error: "missing identifier" }, { status: 400 });
  }

  // Use the slug if provided, otherwise fallback to id (rapi/v7 usually needs slug)
  const identifier = slug || hvId;
  const apiUrl = `https://hanime.tv/rapi/v7/videos_manifests/${identifier}`;
  
  const ts = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHmac("sha256", HANIME_SECRET)
    .update(ts)
    .digest("hex");

  const res = await fetch(apiUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json",
      "X-Signature": signature,
      "X-Signature-Version": "web2",
      "X-Time": ts,
      "Referer": "https://hanime.tv/",
      "Origin": "https://hanime.tv",
    },
  });

  if (!res.ok) {
    // If rapi/v7 fails, fallback to the old mirror as a last resort
    const fallbackRes = await fetch(`https://cached.freeanimehentai.net/api/v8/guest/videos/${hvId}/manifest`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "X-Signature": signature,
        "X-Signature-Version": "web2",
        "X-Time": ts,
        "Referer": "https://hanime.tv/",
        "Origin": "https://hanime.tv",
      },
    });
    
    if (!fallbackRes.ok) {
      return NextResponse.json({ error: "upstream failed", status: res.status }, { status: 502 });
    }
    
    const json = await fallbackRes.json();
    const streams = (json?.videos_manifest?.servers ?? [])
      .flatMap((s: any) => s.streams)
      .filter((st: any) => st.kind !== "premium_alert" && st.url);
    
    return NextResponse.json({ streams });
  }

  const json = await res.json();
  const streams = (json?.videos_manifest?.servers ?? [])
    .flatMap((s: any) => s.streams)
    .filter((st: any) => st.kind !== "premium_alert" && st.url)
    .map((st: any) => {
      let finalUrl = st.url;
      // Fix for streamable.cloud placeholders
      if (finalUrl.includes("streamable.cloud") && st.extra2) {
        finalUrl = `https://weeb.hanime.tv${st.extra2}`;
      }
      return {
        ...st,
        url: finalUrl,
        height: st.height || "720",
      };
    });

  return NextResponse.json({ streams });
}
