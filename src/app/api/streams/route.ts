import { NextRequest, NextResponse } from "next/server";
import Hanime from "@/lib/providers/hanime";

export async function GET(req: NextRequest) {
  let hvId = req.nextUrl.searchParams.get("hvId");
  const slug = req.nextUrl.searchParams.get("slug");

  if (!slug && !hvId) {
    return NextResponse.json({ error: "missing identifier", streams: [] }, { status: 400 });
  }

  let streams: any[] = [];

  // Method 1: Resolve ID using search.htv-services.com with intelligent longest-word fallback
  if ((!hvId || hvId === "0") && slug) {
    try {
      const words = slug.split("-").filter(w => w.length > 2);
      const longestWord = words.length > 0 ? words.sort((a, b) => b.length - a.length)[0] : slug.split("-")[0];
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const searchRes = await fetch('https://search.htv-services.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          search_text: longestWord, 
          tags: [], 
          tags_mode: 'AND', 
          brands: [], 
          blacklist: [], 
          order_by: 'created_at_unix', 
          ordering: 'desc',
          page: 0 
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const hits = typeof searchData.hits === 'string' ? JSON.parse(searchData.hits) : searchData.hits;
        const match = (hits || []).find((h: any) => h.slug === slug);
        if (match && match.id) {
          hvId = match.id.toString();
        }
      }
    } catch (e) {
      console.error("Search API lookup failed:", e);
    }
  }

  const hanime = new Hanime();

  // Method 2: Primary Robust Fetch (Worker -> HMAC signatures) - prioritized because it returns REAL URLs
  if (hvId && hvId !== "0") {
    try {
      streams = await hanime.getStreams(hvId);
    } catch (error) {
      console.error("Method 2 (HMAC) fetch error:", error);
    }
  }

  // Method 3: Fallback Direct API (if Method 2 is 401/empty or legacy)
  if (streams.length === 0 && slug) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const directRes = await fetch(`https://hanime.tv/api/v8/video?id=${slug}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      if (directRes.ok) {
        const directData = await directRes.json();
        if (directData?.videos_manifest?.servers) {
          streams = directData.videos_manifest.servers
            .flatMap((s: any) => s.streams || [])
            .filter((st: any) => st.kind !== "premium_alert" && st.url)
            .map((st: any) => {
              let finalUrl = st.url;
              if (finalUrl.includes("streamable.cloud") && st.extra2) {
                finalUrl = `https://weeb.hanime.tv${st.extra2}`;
              } else if (finalUrl.includes("streamable.cloud")) {
                // Reconstruct legacy manifest path for Shiva/Legacy servers
                finalUrl = `https://weeb.hanime.tv/weeb-api-cache/api/v8/m3u8s/${st.id}.m3u8`;
              }
              // MUST wrap in worker proxy to bypass CORS and fix fake domain issues
              const proxiedUrl = `https://hanime-worker.vaibhavyadav9988777.workers.dev/m3u8?url=${encodeURIComponent(finalUrl)}`;
              return { ...st, url: proxiedUrl, height: st.height || "720" };
            });
        }
      }
    } catch (e) {
      console.error("Method 3 (Direct) fetch error:", e);
    }
  }

  // Final validation and structured response
  if (streams && streams.length > 0) {
    streams.sort((a: any, b: any) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0));
    return NextResponse.json({ streams });
  }

  return NextResponse.json({ 
    error: "upstream failed", 
    streams: [] 
  }, { status: 502 });
}
