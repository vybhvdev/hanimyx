import { load } from "cheerio";
import dns from "node:dns";
import https from "node:https";
import { HttpsProxyAgent } from "https-proxy-agent";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

// Custom fetch to bypass Next.js/undici IPv6 timeout bug in Termux
function fetchHtml(url: string, headers: Record<string, string>): Promise<string> {
  return new Promise((resolve, reject) => {
    const proxyUrl = process.env.PROXY_URL;
    const options: https.RequestOptions = { headers };
    if (proxyUrl) {
      options.agent = new HttpsProxyAgent(proxyUrl);
    }
    
    https.get(url, options, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Handle redirect
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, url).href;
        }
        return fetchHtml(redirectUrl, headers).then(resolve).catch(reject);
      }
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

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
      console.log(`[HentaiCity Scraper] Requesting: ${url}`);
      const html = await fetchHtml(url, this.HEADERS);
      console.log(`[HentaiCity Scraper] Received HTML length: ${html.length}`);
      
      const $ = load(html);
      const videos: any[] = [];
      
      $('.item').each((_, el) => {
        const link = $(el).find('a.video-title');
        if (!link.length) return;
        const href = link.attr('href') || '';
        let slug = href.split('/').pop() || '';
        slug = slug.replace(/\.html$/, ''); // Remove .html to keep URLs clean
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
      
      console.log(`[HentaiCity Scraper] Successfully parsed ${videos.length} videos from the list`);
      return videos;
    } catch (e) {
      console.error("[HentaiCity Scraper] scrapeList error:", e);
      return [];
    }
  }

  public async getInfo(slug: string) {
    try {
      const fetchSlug = slug.endsWith('.html') ? slug : `${slug}.html`;
      console.log(`[HentaiCity Info] Fetching info for: ${fetchSlug}`);
      const html = await fetchHtml(`${this.BASE_URL}/video/${fetchSlug}`, this.HEADERS);
      
      const $ = load(html);
      const title = $('title').text().replace(' - Hentai City', '').trim() || slug;
      const coverUrl = $('meta[property="og:image"]').attr('content') || '';
      const desc = $('meta[property="og:description"]').attr('content') || '';
      
      const cleanSlug = slug.replace(/\.html$/, '');
      
      return {
        hentai_video: {
          id: cleanSlug,
          name: title,
          description: desc,
          slug: cleanSlug,
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
             id: cleanSlug,
             name: title,
             slug: cleanSlug,
             poster_url: coverUrl
          }
        ]
      };
    } catch (e) {
      console.error("[HentaiCity Info] Error:", e);
      return null;
    }
  }

  public async getStreams(identifier: string) {
    try {
      const fetchId = identifier.endsWith('.html') ? identifier : `${identifier}.html`;
      console.log(`[HentaiCity Streams] Fetching streams for: ${fetchId}`);
      const html = await fetchHtml(`${this.BASE_URL}/video/${fetchId}`, this.HEADERS);
      const streamMatch = html.match(/https:\/\/[^"]+\.m3u8[^"]*/);
      
      if (streamMatch) {
        console.log(`[HentaiCity Streams] Found m3u8 link successfully.`);
        return [{
          id: identifier.replace(/\.html$/, ''),
          url: streamMatch[0],
          height: "1080",
          filesize_mbs: 0
        }];
      }
      console.log(`[HentaiCity Streams] No m3u8 link found in HTML.`);
      return [];
    } catch (e) {
      console.error("[HentaiCity Streams] Error:", e);
      return [];
    }
  }
}
