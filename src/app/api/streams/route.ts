import { NextRequest, NextResponse } from "next/server";
import HentaiCity from "@/lib/providers/hentaicity";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "missing identifier", streams: [] }, { status: 400 });
  }

  const hentaicity = new HentaiCity();
  let streams: any[] = [];

  try {
    streams = await hentaicity.getStreams(slug);
  } catch (error) {
    console.error("HentaiCity fetch error:", error);
  }

  if (streams && streams.length > 0) {
    return NextResponse.json({ streams });
  }

  return NextResponse.json({ 
    error: "upstream failed", 
    streams: [] 
  }, { status: 502 });
}
