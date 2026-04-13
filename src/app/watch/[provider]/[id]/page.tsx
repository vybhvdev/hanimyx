export const maxDuration = 30;

import WatchPageClient from "@/components/WatchPageClient";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { provider: string; id: string } }): Promise<Metadata> {
  const { provider, id: slug } = params;
  if (provider !== "hanime") {
    return { title: "Not Found" };
  }

  try {
    const searchRes = await fetch('https://search.htv-services.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search_text: slug.replace(/-/g, " "), tags: [], tags_mode: 'AND', brands: [], blacklist: [], order_by: 'created_at_unix', page: 0 }),
      next: { revalidate: 3600 }
    });
    
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const hits = typeof searchData.hits === 'string' ? JSON.parse(searchData.hits) : searchData.hits;
      const match = (hits || []).find((h: any) => h.slug === slug);
      
      if (match) {
        const title = `${match.name} - Hanimyx`;
        const description = match.description || "Watch high quality hentai on Hanimyx";
        const image = match.poster_url || match.cover_url;

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            images: image ? [image] : [],
          },
          twitter: {
            card: "summary_large_image",
            title,
            description,
            images: image ? [image] : [],
          }
        };
      }
    }
  } catch (error) {
    console.error("generateMetadata error:", error);
  }

  const fallbackTitle = `${slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} - Hanimyx`;
  return {
    title: fallbackTitle,
    description: "Watch high quality hentai on Hanimyx"
  };
}

export default function WatchPage({
  params,
}: {
  params: { provider: string; id: string };
}) {
  const { provider, id: slug } = params;

  if (provider !== 'hanime') {
    return <div className="p-8 text-center bg-[#0a0a0a] min-h-screen text-white">Provider {provider} not yet implemented</div>;
  }

  return <WatchPageClient slug={slug} />;
}
