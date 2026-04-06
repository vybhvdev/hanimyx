import { load } from "cheerio";

export interface HanimeVideo {
  id: number;
  name: string;
  slug: string;
  description: string;
  views: number;
  interests: number;
  posterUrl: string;
  coverUrl: string;
  brand: {
    name: string;
    id: string;
  };
  durationMs: number;
  isCensored: boolean;
  likes: number;
  rating: number;
  tags: string[];
  createdAt: string;
  releasedAt: string;
}

export default class Hanime {
  private readonly BASE_URL = "https://hanime.tv";
  private readonly SEARCH_URL = "https://search.htv-services.com";

  public async getRecent(page = 1) {
    const response = await fetch(this.SEARCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blacklist: [],
        brands: [],
        order_by: "created_at_unix",
        page: page - 1,
        tags: [],
        search_text: "",
        tags_mode: "AND",
      }),
    });

    const data = await response.json();
    const hits = JSON.parse(data.hits);
    return hits.map(this.mapToVideo);
  }

  public async search(query: string, page = 1) {
    const response = await fetch(this.SEARCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blacklist: [],
        brands: [],
        order_by: "created_at_unix",
        page: page - 1,
        tags: [],
        search_text: query,
        tags_mode: "AND",
      }),
    });
    const data = await response.json();
    const hits = JSON.parse(data.hits);
    return hits.map(this.mapToVideo);
  }

  public async getInfo(slug: string) {
    const url = `${this.BASE_URL}/videos/hentai/${slug}`;
    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);
    const script = $('script:contains("window.__NUXT__")').html();
    if (!script) return null;
    
    // Simple extraction of the JSON part from NUXT script
    const jsonStr = script.replace("window.__NUXT__=", "").split(";")[0];
    const json = eval(`(${jsonStr})`); // Nuxt state is often JS, eval is risky but common for Nuxt extraction in simple scripts
    
    return json.state.data.video;
  }

  public async getStreams(slug: string) {
    const apiUrl = `https://hanime.tv/rapi/v7/videos_manifests/${slug}`;
    const signature = Array.from({ length: 32 }, () => 
        Math.floor(Math.random() * 16).toString(16)).join('');

    const response = await fetch(apiUrl, {
        headers: {
            'x-signature': signature,
            'x-time': Math.floor(Date.now() / 1000).toString(),
            'x-signature-version': 'web2',
        }
    });

    const json = await response.json();
    return json.videos_manifest.servers.map((s: any) => s.streams).flat();
  }

  private mapToVideo(raw: any): any {
    return {
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      views: raw.views,
      posterUrl: raw.poster_url,
      coverUrl: raw.cover_url,
      brand: raw.brand,
      durationMs: raw.duration_in_ms,
      tags: raw.tags,
      releasedAt: raw.released_at,
    };
  }
}
