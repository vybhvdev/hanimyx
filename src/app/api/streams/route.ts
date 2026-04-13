import { NextRequest, NextResponse } from "next/server";
import Hanime from "@/lib/providers/hanime";

export async function GET(req: NextRequest) {
  let hvId = req.nextUrl.searchParams.get("hvId");
  const slug = req.nextUrl.searchParams.get("slug");

  // Attempt to resolve hvId from slug if not provided using the unblocked search API
  if (!hvId || hvId === "0") {
    if (slug) {
      try {
        const searchRes = await fetch('https://search.htv-services.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ search_text: slug.replace(/-/g, " "), tags: [], tags_mode: 'AND', brands: [], blacklist: [], order_by: 'created_at_unix', page: 0 })
        });
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const hits = typeof searchData.hits === 'string' ? JSON.parse(searchData.hits) : searchData.hits;
          const match = (hits || []).find((h: any) => h.slug === slug);
          if (match && match.id) {
            hvId = match.id.toString();
          }
        }
      } catch (e) {
        console.error("Failed to resolve slug to hv_id:", e);
      }
    }
  }

  const hanime = new Hanime();

  // If we have a numeric ID, get streams (the fallback HMAC API requires this ID to succeed)
  if (hvId && hvId !== "0") {
    const streams = await hanime.getStreams(hvId);
    if (streams && streams.length > 0) {
      return NextResponse.json({ streams });
    }
  }

  // Fallback to slug just in case the ID lookup failed, but the worker might still have it cached
  if (slug) {
    const streams = await hanime.getStreams(slug);
    if (streams && streams.length > 0) {
      return NextResponse.json({ streams });
    }
  }

  return NextResponse.json({ error: "missing identifier or upstream failed" }, { status: 502 });
}
