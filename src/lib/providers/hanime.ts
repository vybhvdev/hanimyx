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
    return this.htvSearch({
      order_by: "created_at_unix",
      page: page - 1,
      search_text: "",
      tags: [],
    });
  }

  public async getPopular(page = 1) {
    return this.htvSearch({
      order_by: "views",
      page: page - 1,
      search_text: "",
      tags: [],
    });
  }

  public async getTrending(page = 1) {
    return this.htvSearch({
      order_by: "monthly_rank",
      ordering: "asc",
      page: page - 1,
      search_text: "",
      tags: [],
    });
  }

  public async search(query: string, page = 1) {
    return this.htvSearch({
      order_by: "created_at_unix",
      page: page - 1,
      search_text: query,
      tags: [],
    });
  }

  public async searchByTag(tag: string, page = 1) {
    return this.htvSearch({
      order_by: "created_at_unix",
      page: page - 1,
      search_text: "",
      tags: [tag],
    });
  }

  private async htvSearch(options: {
    blacklist?: string[];
    brands?: string[];
    order_by?: string;
    ordering?: "asc" | "desc";
    page?: number;
    tags?: string[];
    search_text?: string;
    tags_mode?: "AND" | "OR";
  }) {
    try {
      const response = await fetch(this.SEARCH_URL, {
        method: "POST",
        headers: { ...this.HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({
          blacklist: options.blacklist || [],
          brands: options.brands || [],
          order_by: options.order_by || "created_at_unix",
          ordering: options.ordering || "desc",
          page: options.page || 0,
          tags: options.tags || [],
          search_text: options.search_text || "",
          tags_mode: options.tags_mode || "AND",
        }),
      });

      if (!response.ok) {
        // Fallback to mirror search
        const fallbackRes = await fetch("https://cached.freeanimehentai.net/api/v10/search_hvs", {
          method: "POST",
          headers: { ...this.HEADERS, "Content-Type": "application/json" },
          body: JSON.stringify({
            search_text: options.search_text || "",
            page: options.page || 0,
            tags: options.tags || [],
            order_by: options.order_by || "created_at_unix",
            ordering: options.ordering || "desc"
          })
        });
        if (!fallbackRes.ok) return [];
        const data = await fallbackRes.json();
        const hits = typeof data.hits === 'string' ? JSON.parse(data.hits) : data.hits;
        return (hits || []).map((hit: any) => this.mapToVideo(hit));
      }

      const data = await response.json();
      const hits = typeof data.hits === 'string' ? JSON.parse(data.hits) : data.hits;
      return (hits || []).map((hit: any) => this.mapToVideo(hit));
    } catch (e) {
      console.error("HTV Search error:", e);
      return [];
    }
  }

  public async getTags() {
    try {
      const response = await fetch("https://haniapi-nyt92.vercel.app/browse");
      if (response.ok) {
        const data = await response.json();
        return (data.tags || []).map((t: any) => ({
          id: t.id,
          text: t.text,
          count: t.count,
          description: t.description,
          imageUrl: t.wide_image_url || t.tall_image_url
        }));
      }
    } catch (e) {
      console.error("HaniAPI getTags error:", e);
    }
    return [];
  }

  public async getBrands() {
    try {
      const response = await fetch("https://haniapi-nyt92.vercel.app/browse");
      if (response.ok) {
        const data = await response.json();
        return (data.brands || []).map((b: any) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          count: b.count,
          logoUrl: b.logo_url
        }));
      }
    } catch (e) {
      console.error("HaniAPI getBrands error:", e);
    }
    return [];
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

  public async getStreams(identifier: string | number) {
    try {
      // Try Cloudflare Worker first
      const haniApiUrl = `https://hanime-worker.vaibhavyadav9988777.workers.dev/streams/${identifier}`;
      const haniRes = await fetch(haniApiUrl);
      if (haniRes.ok) {
        const haniJson = await haniRes.json();
        const streams = Array.isArray(haniJson) ? haniJson : (haniJson.streams || []);
        
        if (streams.length > 0) {
          return streams.map((st: any) => ({
            ...st,
            url: st.url,
            height: st.height || "720",
          }));
        }
      }
    } catch (e) {
      console.error("Worker Streams error:", e);
    }

    const ts = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", this.SECRET)
      .update(ts)
      .digest("hex");

    try {
      const response = await fetch(
        `https://cached.freeanimehentai.net/api/v8/guest/videos/${identifier}/manifest`,
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
            height: st.height || "720",
          };
        });
    } catch (e) {
      console.error("Fallback Streams error:", e);
      return [];
    }
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
