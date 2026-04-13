import { NextRequest, NextResponse } from "next/server";
import Hanime from "@/lib/providers/hanime";

export async function GET(req: NextRequest) {
  let hvId = req.nextUrl.searchParams.get("hvId");
  const slug = req.nextUrl.searchParams.get("slug");

  if (!slug && !hvId) {
    return NextResponse.json({ error: "missing identifier", streams: [] }, { status: 400 });
  }

  let streams: any[] = [];

  // Method 1: Direct JSON API (Fastest & most reliable, ignores CF HTML blocks and includes streams natively)
  if (slug) {
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
        
        // Grab the exact numeric ID just in case we need the fallback later
        if (directData?.hentai_video?.id) {
          hvId = directData.hentai_video.id.toString();
        }
        
        // Grab streams if they exist directly in the payload!
        if (directData?.videos_manifest?.servers) {
          const directStreams = directData.videos_manifest.servers
            .flatMap((s: any) => s.streams || [])
            .filter((st: any) => st.kind !== "premium_alert" && st.url)
            .map((st: any) => {
              let finalUrl = st.url;
              if (finalUrl.includes("streamable.cloud") && st.extra2) {
                finalUrl = `https://weeb.hanime.tv${st.extra2}`;
              }
              return { ...st, url: finalUrl, height: st.height || "720" };
            });
            
          if (directStreams.length > 0) {
            streams = directStreams;
          }
        }
      }
    } catch (e) {
      console.error("Direct API fetch failed:", e);
    }
  }

  // Method 2: Resolve ID using search.htv-services.com with intelligent longest-word fallback
  if ((!hvId || hvId === "0") && slug && streams.length === 0) {
    try {
      // Intelligently extract the longest, most unique word from the slug for the search engine
      const words = slug.split("-").filter(w => w.length > 2);
      const longestWord = words.length > 0 ? words.sort((a, b) => b.length - a.length)[0] : slug.split("-")[0];
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
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
        } else if (hits && hits.length > 0) {
          // Desperate fallback to the first search hit
          hvId = hits[0].id.toString();
        }
      }
    } catch (e) {
      console.error("Search API ID lookup failed:", e);
    }
  }

  // Method 3: Use Hanime provider fallback (Worker -> HMAC signatures)
  if (streams.length === 0) {
    const hanime = new Hanime();
    try {
      if (hvId && hvId !== "0") {
        streams = await hanime.getStreams(hvId);
      }
      
      if ((!streams || streams.length === 0) && slug) {
        // Absolute last resort
        streams = await hanime.getStreams(slug);
      }
    } catch (error) {
      console.error("Hanime provider fetch error:", error);
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
