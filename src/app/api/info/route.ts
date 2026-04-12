import { NextResponse } from 'next/server';
import Hanime from '@/lib/providers/hanime';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  try {
    const hanime = new Hanime();
    const info = await hanime.getInfo(slug);

    if (!info) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json(info, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
