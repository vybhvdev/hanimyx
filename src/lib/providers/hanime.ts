import { load } from "cheerio";
import crypto from "crypto";

export default class Hanime {
  private readonly BASE_URL = "https://hanime.tv";
  private readonly SEARCH_URL = "https://search.htv-services.com";
  private readonly SECRET = "865473ac43246402343d6433337a4330";
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
        const json = new Function(`return ${jsonStr}`)();
        return json.state.data.video;
    } catch (e) {
        console.error("Failed to parse Nuxt state", e);
        return null;
    }
  }

  public async getStreams(slug: string, videoId?: number, info?: any) {
    // Strategy: manifest API is the only reliable source for non-premium direct URLs
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Attempt standard URL first
    const manifestUrl = `https://hanime.tv/rapi/v7/videos_manifests/${slug}`;
    const signature = crypto.createHmac("sha256", this.SECRET).update(timestamp).digest("hex");

    try {
        const response = await fetch(manifestUrl, {
            headers: {
                ...this.HEADERS,
                'x-signature': signature,
                'x-time': timestamp,
                'x-signature-version': 'web2',
                'Referer': `https://hanime.tv/videos/hentai/${slug}`,
                'Origin': 'https://hanime.tv',
            }
        });

        if (response.ok) {
            const json = await response.json();
            const streams = json.videos_manifest.servers
                .flatMap((s: any) => s.streams)
                .filter((st: any) => st.kind !== "premium_alert")
                .map((st: any) => ({
                    ...st,
                    // If url is a placeholder but extra2 has a path, construct it
                    url: (st.url.includes("streamable.cloud") && st.extra2) 
                        ? `https://weeb.hanime.tv${st.extra2}` 
                        : st.url
                }));
            
            if (streams.length > 0) return streams;
        }
    } catch (e) {
        console.error("Manifest API Fetch Error:", e);
    }

    // Fallback to Nuxt state if API fails, but filter out placeholders
    if (info?.videos_manifest?.servers) {
        return info.videos_manifest.servers
            .flatMap((s: any) => s.streams)
            .filter((st: any) => st.kind !== "premium_alert" && !st.url.includes("streamable.cloud"));
    }

    return [];
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
