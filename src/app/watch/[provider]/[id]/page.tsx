export const maxDuration = 30;

import WatchPageClient from "@/components/WatchPageClient";

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
