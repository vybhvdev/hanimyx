import { NextRequest, NextResponse } from 'next/server';
import dns from 'node:dns';
import https from 'node:https';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

function fetchImage(url: string, headers: Record<string, string>): Promise<{ buffer: Buffer; contentType: string; status: number }> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, url).href;
        }
        return fetchImage(redirectUrl, headers).then(resolve).catch(reject);
      }
      
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => { chunks.push(chunk); });
      res.on('end', () => { 
        resolve({
          buffer: Buffer.concat(chunks),
          contentType: res.headers['content-type'] || 'image/jpeg',
          status: res.statusCode || 200
        }); 
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  
  if (!url || !url.startsWith('http')) {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  const referer = url.includes('hentaicity') ? 'https://www.hentaicity.com/' : 'https://hanime.tv/';

  try {
    console.log(`[Image Proxy] Fetching: ${url}`);
    const { buffer, contentType, status } = await fetchImage(url, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': referer,
    });

    if (status >= 400) return new NextResponse('Failed', { status });

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error("[Image Proxy] Error:", error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
