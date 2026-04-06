import { load } from "cheerio";

export default class Hanime {
  private readonly BASE_URL = "https://hanime.tv";
  private readonly SEARCH_URL = "https://search.htv-services.com";
  private readonly HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
  };

  public async getRecent(page = 1) {
    const response = await fetch(this.SEARCH_URL, {
      method: "POST",
      headers: { ...this.HEADERS, "Content-Type": "application/json" },
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

    if (!response.ok) return [];
    const data = await response.json();
    const hits = typeof data.hits === 'string' ? JSON.parse(data.hits) : data.hits;
    return hits.map(this.mapToVideo);
  }

  public async search(query: string, page = 1) {
    const response = await fetch(this.SEARCH_URL, {
      method: "POST",
      headers: { ...this.HEADERS, "Content-Type": "application/json" },
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
    if (!response.ok) return [];
    const data = await response.json();
    const hits = typeof data.hits === 'string' ? JSON.parse(data.hits) : data.hits;
    return hits.map(this.mapToVideo);
  }

  public async getInfo(slug: string) {
    const url = `${this.BASE_URL}/videos/hentai/${slug}`;
    const response = await fetch(url, { headers: this.HEADERS });
    if (!response.ok) return null;
    
    const html = await response.text();
    const $ = load(html);
    const script = $('script:contains("window.__NUXT__")').html();
    if (!script) return null;
    
    try {
        const jsonStr = script.replace("window.__NUXT__=", "").split(";")[0];
        // Safe evaluation of Nuxt state (it's JS, not JSON)
        const json = new Function(`return ${jsonStr}`)();
        return json.state.data.video;
    } catch (e) {
        console.error("Failed to parse Nuxt state", e);
        return null;
    }
  }

  public async getStreams(info: any) {
    if (!info || !info.videos_manifest) return [];
    
    try {
        return info.videos_manifest.servers.map((s: any) => s.streams).flat();
    } catch (e) {
        console.error("Failed to extract streams from info", e);
        return [];
    }
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
