# Hanimyx Architecture & Context

This file contains the foundational context, architecture decisions, and design system for the `hanimyx` project and its associated Cloudflare Worker (`hanime-worker`). 

**Note to Gemini CLI:** Always refer to this document for context on how the video streaming, metadata extraction, and design system work before making changes.

## 1. Architecture Overview

The ecosystem consists of two main parts:
1.  **Hanimyx (Frontend)**: A Next.js 14 application serving as the UI. It uses server-side rendering (SSR) and Server Components for data fetching and SEO, with Client Components for the video player and interactive elements.
2.  **Hanime Worker (Backend Proxy)**: A Cloudflare Worker (`hanime-worker` repository, deployed at `hanime-worker.vaibhavyadav9988777.workers.dev`) that bypasses CORS, extracts protected video IDs (`hv_id`), and proxies the AES decryption key (`sign.bin`) and video segments (`.ts` files).

## 2. Design System (HentaiCity Aesthetic)

*   **Theme**: Strict Dark Mode.
*   **Backgrounds**: Primary background is `#0d0d0d`. Card/Section backgrounds use `#0a0a0a`.
*   **Accent Color**: Red (`#e53333`). Used for active states, borders on hover, loading spinners, and the custom progress bar in the video player.
*   **Typography**: Bold, high-contrast sans-serif. Heavy use of `uppercase`, `tracking-widest` (letter spacing), and `font-black`.
*   **Layout**: Dense, poster-style vertical grid (aspect ratio `2/3` for cards) to maximize cover visibility. 2 columns on mobile, up to 6 columns on desktop. Horizontal scrollable sections (no-scrollbar) for "Trending" and "Manga".
*   **Components**: Pill-shaped buttons with semi-transparent `bg-white/5` backgrounds, `backdrop-blur` overlays, and smooth hover transitions.

## 3. Data Fetching & Providers (`src/lib/providers/hanime.ts`)

*   **Metadata (getInfo)**: Fetches primary metadata from `haniapi-nyt92.vercel.app` (timeout 3s), runs a parallel fetch to scrape `hanime.tv` HTML for franchise episodes and exact video names (timeout 4s), and combines them using `Promise.allSettled`.
*   **Streams (getStreams)**: Fetches from the Cloudflare Worker `/streams/:slug` or `/streams-by-id/:id`. The worker returns a plain JSON array of stream objects.
*   **Search/Listings**: `getRecent`, `getPopular`, `getTrending`, `search`, and `searchByTag` POST directly to `https://search.htv-services.com` (bypassing HaniAPI for reliability) using 0-based pagination.
*   **Pagination**: Server components (`page.tsx`, `popular/page.tsx`, `tags/[tag]/page.tsx`) use `export const dynamic = "force-dynamic"` to ensure URL `searchParams.page` updates trigger a re-render.

## 4. Video Player (`src/components/VideoPlayer.tsx`)

*   **Core Library**: Uses `hls.js` for native AES-128 decryption support. 
*   **Custom UI**: Fully custom React-based control overlay. Native HTML5 controls are disabled. Includes quality selection (360p, 480p, 720p, 1080p), speed control, and keyboard shortcuts (Space, M, F, Arrows).
*   **Backdrop**: Displays a blurred `coverUrl` backdrop during the initial loading phase ("Syncing Uplink").
*   **Fullscreen**: Mobile fullscreen automatically locks to landscape orientation using `screen.orientation.lock("landscape")`.

## 5. Cloudflare Worker Capabilities (`hanime-worker/index.js`)

*   **`hv_id` Extraction**: Since Hanime.tv compresses its Nuxt state, the worker uses multiple fallback regex patterns (slug-adjacent, JSON key match, variable reference lookup) to reliably extract the `hv_id` and video tags/names without evaluating JavaScript.
*   **HMAC Auth**: Generates an HMAC-SHA256 signature using the secret `865473ac43246402343d6433337a4330` to authenticate with the `cached.freeanimehentai.net` manifest API (v10 `search_hvs`).
*   **AES Decryption Proxying**: 
    *   Proxies `/sign.bin` to serve the AES decryption key.
    *   `/m3u8` endpoint rewrites the playlist to use the proxied `sign.bin` and rewrites all `.ts` segment URLs to pass through the `/seg` endpoint.
    *   `/seg` endpoint fetches individual video chunks to bypass browser CORS restrictions.

## 6. External Integrations

*   **Images**: All external images (hanime-cdn.com, i.pururin.me, pururin.to) are routed through Next.js API route `src/app/api/image/route.ts` to inject the correct `Referer` headers and prevent hotlink blocking.
*   **Hentyx (Manga)**: The homepage footer fetches trending manga from `hentyx.vercel.app/api/popular` and links directly to the Hentyx reader.
*   **Analytics**: Integrated with `@vercel/analytics`.
