export const maxDuration = 30;

import WatchPageClient from "@/components/WatchPageClient";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { provider: string; id: string } }): Promise<Metadata> {
  const { provider, id: slug } = params;
  if (provider !== "hentaicity") {
    return { title: "Not Found" };
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

  if (provider !== 'hentaicity') {
    return <div className="p-8 text-center bg-[#0a0a0a] min-h-screen text-white">Provider {provider} not yet implemented</div>;
  }

  return <WatchPageClient slug={slug} />;
}
