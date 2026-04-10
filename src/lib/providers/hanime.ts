import { load } from "cheerio";
import crypto from "crypto";

export const HANIME_SECRET = "865473ac43246402343d6433337a4330";

export default class Hanime {
  private readonly BASE_URL = "https://hanime.tv";
  private readonly SEARCH_URL = "https://search.htv-services.com";
  private readonly SECRET = HANIME_SECRET;
  private readonly HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
  };

  public async getRecent(page = 1) {
    try {
      const haniApiUrl = `https://haniapi-nyt92.vercel.app/search?q=&order_by=created_at_unix&ordering=desc`;
      const response = await fetch(haniApiUrl);
      if (response.ok) {
        const data = await response.json();
        const results = data.results || [];
        return results.map((raw: any) => ({
          id: raw.id,
          name: raw.name || raw.title,
          slug: raw.slug,
          description: raw.description,
          views: raw.views,
          posterUrl: raw.cover_url || raw.poster_url,
          coverUrl: raw.cover_url,
          brand: raw.brand,
          durationMs: raw.duration_in_ms,
          tags: raw.tags || [],
          releasedAt: raw.released_at || raw.created_at,
        }));
      }
    } catch (e) {
      console.error("HaniAPI Recent error:", e);
    }

    let response = await fetch(this.SEARCH_URL, {
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

    if (!response.ok) {
        // Fallback to mirror search
        response = await fetch("https://cached.freeanimehentai.net/api/v10/search_hvs", {
            method: "POST",
            headers: { ...this.HEADERS, "Content-Type": "application/json" },
            body: JSON.stringify({
                search_text: "",
                page: page - 1,
                order_by: "created_at_unix",
                ordering: "desc"
            })
        });
    }

    if (!response.ok) return [];
    const data = await response.json();
    const hits = typeof data.hits === 'string' ? JSON.parse(data.hits) : data.hits;
    return hits.map(this.mapToVideo);
  }

  public async search(query: string, page = 1) {
    try {
      const haniApiUrl = `https://haniapi-nyt92.vercel.app/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(haniApiUrl);
      if (response.ok) {
        const data = await response.json();
        const results = data.results || [];
        return results.map((raw: any) => ({
          id: raw.id,
          name: raw.name || raw.title,
          slug: raw.slug,
          description: raw.description,
          views: raw.views,
          posterUrl: raw.cover_url || raw.poster_url,
          coverUrl: raw.cover_url,
          brand: raw.brand,
          durationMs: raw.duration_in_ms,
          tags: raw.tags || [],
          releasedAt: raw.released_at || raw.created_at,
        }));
      }
    } catch (e) {
      console.error("HaniAPI Search error:", e);
    }

    let response = await fetch(this.SEARCH_URL, {
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

    if (!response.ok) {
        // Fallback to mirror search
        response = await fetch("https://cached.freeanimehentai.net/api/v10/search_hvs", {
            method: "POST",
            headers: { ...this.HEADERS, "Content-Type": "application/json" },
            body: JSON.stringify({
                search_text: query,
                page: page - 1,
            })
        });
    }

    if (!response.ok) return [];
    const data = await response.json();
    const hits = typeof data.hits === 'string' ? JSON.parse(data.hits) : data.hits;
    return hits.map(this.mapToVideo);
  }

  public async getInfo(slug: string) {
    try {
      const haniApiUrl = `https://haniapi-nyt92.vercel.app/getInfo/${slug}`;
      const haniRes = await fetch(haniApiUrl);
      if (haniRes.ok) {
        const haniJson = await haniRes.json();
        if (haniJson && haniJson.id) {
          // Map to the structure expected by the WatchPage
          return {
            hentai_video: {
              id: haniJson.id,
              description: haniJson.description,
              slug: haniJson.slug,
              poster_url: haniJson.poster,
              views: parseInt(haniJson.views?.replace(/,/g, '') || "0"),
              rating: 0,
              likes: 0,
              downloads: 0,
            },
            hentai_tags: (haniJson.tags || []).map((t: string) => ({ text: t })),
            hentai_franchise: {
              name: haniJson.title
            },
            hentai_franchise_hentai_videos: []
          };
        }
      }
    } catch (e) {
      console.error("HaniAPI getInfo error:", e);
    }

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

  public async getStreams(hvId: number) {
    const ts = Math.floor(Date.now() / 1000).toString();
    
    const signature = crypto
      .createHmac("sha256", this.SECRET)
      .update(ts)
      .digest("hex");

    const response = await fetch(
      `https://cached.freeanimehentai.net/api/v8/guest/videos/${hvId}/manifest`,
      {
        headers: {
          ...this.HEADERS,
          "x-signature": signature,
          "x-signature-version": "web2",
          "x-time": ts,
          "Referer": "https://hanime.tv/",
          "Origin": "https://hanime.tv",
        },
      }
    );

    if (!response.ok) return [];
    const json = await response.json();
    return (json?.videos_manifest?.servers ?? [])
      .flatMap((s: any) => s.streams)
      .filter((st: any) => st.kind !== "premium_alert" && st.url)
      .map((st: any) => {
        let finalUrl = st.url;
        if (finalUrl.includes("streamable.cloud") && st.extra2) {
          finalUrl = `https://weeb.hanime.tv${st.extra2}`;
        }
        return {
          ...st,
          url: finalUrl,
        };
      });
  }

  // Helper for client-side signature since 'crypto' module isn't in browser
  public static async generateSignature(ts: string, secret: string) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(ts);
    
    const cryptoKey = await globalThis.crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    
    const signature = await globalThis.crypto.subtle.sign("HMAC", cryptoKey, msgData);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
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
