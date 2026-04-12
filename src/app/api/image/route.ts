import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url || (!url.startsWith('https://hanime-cdn.com') && !url.startsWith('https://i.pururin.me') && !url.startsWith('https://pururin.to'))) {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  const referer = url.includes('pururin') ? 'https://pururin.to/' : 'https://hanime.tv/';

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': referer,
    },
  });

  if (!response.ok) return new NextResponse('Failed', { status: response.status });

  const buffer = await response.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
