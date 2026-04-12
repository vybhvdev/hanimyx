import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  try {
    const workerUrl = `https://hanime-worker.vaibhavyadav9988777.workers.dev/info/${slug}?t=${Date.now()}`;
    const infoRes = await fetch(workerUrl, {
      headers: {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!infoRes.ok) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const info = await infoRes.json();

    let hvId = info.id || 0;
    if (hvId === 0) {
      try {
        const searchRes = await fetch('https://search.htv-services.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ search_text: slug.replace(/-/g, " "), tags: [], tags_mode: 'AND', brands: [], blacklist: [], order_by: 'created_at_unix', page: 0 })
        });
        const searchData = await searchRes.json();
        const hits = typeof searchData.hits === 'string' ? JSON.parse(searchData.hits) : searchData.hits;
        const match = (hits || []).find((h: any) => h.slug === slug);
        if (match) hvId = match.id;
      } catch(e) {}
    }

    const mappedInfo = {
      hentai_video: {
        id: hvId,
        name: info.name || slug,
        description: info.description || "",
        slug: slug,
        poster_url: "",
        views: info.views || 0,
        rating: 0,
        likes: 0,
        downloads: 0,
        tags: Array.isArray(info.tags) ? info.tags : [],
      },
      hentai_tags: Array.isArray(info.tags) ? info.tags.map((t: string) => ({ text: t })) : [],
      hentai_franchise: {
        name: info.franchiseName || "",
        slug: ""
      },
      hentai_franchise_hentai_videos: Array.isArray(info.episodes) ? info.episodes.map((ep: any) => ({
        id: ep.id,
        name: ep.name,
        slug: ep.slug,
        poster_url: ep.posterUrl
      })) : []
    };

    return NextResponse.json(mappedInfo, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
