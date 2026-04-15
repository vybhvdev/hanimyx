import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  
  const allowedDomains = ['https://hanime-cdn.com', 'https://cdn1.images.hentaicity.com', 'https://cdn2.images.hentaicity.com', 'https://www.hentaicity.com'];
  const isAllowed = allowedDomains.some(domain => url?.startsWith(domain));

  if (!url || !isAllowed) {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  const referer = url.includes('hentaicity') ? 'https://www.hentaicity.com/' : 'https://hanime.tv/';

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
  } catch (error) {
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
