import { NextRequest, NextResponse } from "next/server";
import HentaiCity from "@/lib/providers/hentaicity";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.search_text || (body.tags && body.tags.length > 0 ? body.tags[0] : "a");
    const page = body.page ? body.page + 1 : 1;

    const hentaicity = new HentaiCity();
    const videos = await hentaicity.search(query, page);

    // Format to match what the client expects (mocking htv-services response structure)
    return NextResponse.json({
      hits: JSON.stringify(videos)
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ hits: "[]" }, { status: 500 });
  }
}
