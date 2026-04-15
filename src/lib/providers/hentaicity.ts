import { load } from "cheerio";

export default class HentaiCity {
  private readonly BASE_URL = "https://www.hentaicity.com";
  private readonly HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  };

  public async getRecent(page = 1) {
    return this.scrapeList(`${this.BASE_URL}/videos/straight/all-recent${page > 1 ? `-${page}` : ''}.html`);
  }

  public async getPopular(page = 1) {
    return this.scrapeList(`${this.BASE_URL}/videos/straight/all-popular${page > 1 ? `-${page}` : ''}.html`);
  }

  public async getTrending(page = 1) {
    return this.scrapeList(`${this.BASE_URL}/videos/straight/all-view${page > 1 ? `-${page}` : ''}.html`);
  }

  public async search(query: string, page = 1) {
    return this.scrapeList(`${this.BASE_URL}/search/video/${encodeURIComponent(query)}${page > 1 ? `/${page}` : ''}`);
  }

  public async searchByTag(tag: string, page = 1) {
    return this.search(tag, page);
  }

  public async getTags(): Promise<any[]> {
    return [];
  }

  public async getBrands(): Promise<any[]> {
    return [];
  }

  private async scrapeList(url: string) {
    try {
      const res = await fetch(url, { headers: this.HEADERS });
      const html = await res.text();
      const $ = load(html);
      const videos: any[] = [];
      
      $('.item').each((_, el) => {
        const link = $(el).find('a.video-title');
        if (!link.length) return;
        const href = link.attr('href') || '';
        const slug = href.split('/').pop() || '';
        const title = link.attr('title') || link.text();
        const img = $(el).find('.thumb-img img').attr('src') || '';
        const timeStr = $(el).find('.time').text().trim();
        const viewsStr = $(el).find('.info span').last().text().trim();
        const trailer = $(el).find('.trailer video').attr('src') || '';

        let durationMs = 0;
        if (timeStr) {
          const parts = timeStr.split(':').map(Number);
          if (parts.length === 2) durationMs = (parts[0] * 60 + parts[1]) * 1000;
          if (parts.length === 3) durationMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
        }

        videos.push({
          id: slug,
          name: title,
          slug: slug,
          posterUrl: img,
          coverUrl: img,
          trailerUrl: trailer,
          brand: "HentaiCity",
          durationMs,
          views: parseInt(viewsStr) || 0,
          tags: []
        });
      });
      return videos;
    } catch (e) {
      console.error("HentaiCity scrapeList error:", e);
      return [];
    }
  }

  public async getInfo(slug: string) {
    try {
      const res = await fetch(`${this.BASE_URL}/video/${slug}`, { headers: this.HEADERS });
      if (!res.ok) return null;
      const html = await res.text();
      const $ = load(html);
      
      const title = $('title').text().replace(' - Hentai City', '').trim() || slug;
      const coverUrl = $('meta[property="og:image"]').attr('content') || '';
      const desc = $('meta[property="og:description"]').attr('content') || '';
      
      return {
        hentai_video: {
          id: slug,
          name: title,
          description: desc,
          slug: slug,
          poster_url: coverUrl,
          cover_url: coverUrl,
          views: 0,
          rating: 0,
          likes: 0,
          downloads: 0,
          tags: [],
        },
        hentai_tags: [],
        hentai_franchise: { name: "", slug: "" },
        hentai_franchise_hentai_videos: [
          {
             id: slug,
             name: title,
             slug: slug,
             poster_url: coverUrl
          }
        ]
      };
    } catch (e) {
      console.error("HentaiCity getInfo error:", e);
      return null;
    }
  }

  public async getStreams(identifier: string) {
    try {
      const res = await fetch(`${this.BASE_URL}/video/${identifier}`, { headers: this.HEADERS });
      const html = await res.text();
      const streamMatch = html.match(/https:\/\/[^"]+\.m3u8[^"]*/);
      
      if (streamMatch) {
        return [{
          id: identifier,
          url: streamMatch[0],
          height: "1080",
          filesize_mbs: 0
        }];
      }
      return [];
    } catch (e) {
      console.error("HentaiCity getStreams error:", e);
      return [];
    }
  }
}
