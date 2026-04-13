export const maxDuration = 30;

import WatchPageClient from "@/components/WatchPageClient";
import Hanime from "@/lib/providers/hanime";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { provider: string; id: string } }): Promise<Metadata> {
  const { provider, id: slug } = params;
  if (provider !== "hanime") {
    return { title: "Not Found" };
  }
  const hanime = new Hanime();
  const info = await hanime.getInfo(slug);
  
  if (!info || !info.hentai_video) {
    return { title: "Video Not Found" };
  }
  
  const title = `${info.hentai_video.name} - Hanimyx`;
  const description = info.hentai_video.description || "Watch high quality hentai on Hanimyx";
  const image = info.hentai_video.poster_url || info.hentai_video.cover_url;

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
