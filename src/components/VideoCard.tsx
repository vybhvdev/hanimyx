import { getUnifiedTags } from "@/lib/tags";

interface VideoCardProps {
  video: {
    id: number;
    name: string;
    slug: string;
    posterUrl: string;
    tags: string[];
    durationMs: number;
    brand: string;
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  const unifiedTags = getUnifiedTags(video.tags).slice(0, 2);
  const durationMin = Math.floor((video.durationMs || 0) / 60000);
  const proxiedUrl = `/api/image?url=${encodeURIComponent(video.posterUrl)}`;

  return (
    <a
      href={`/watch/hanime/${video.slug}?id=${video.id}`}
      className="group block bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1 shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden bg-white/5">
        <img
          src={proxiedUrl}
          alt={video.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {durationMin > 0 && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-black text-white/90">
            {durationMin}m
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="font-bold text-[11px] leading-tight line-clamp-2 mb-2 text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
          {video.name}
        </h3>
        <div className="flex flex-wrap gap-1">
          {unifiedTags.map(tag => (
            <span key={tag} className="text-[8px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-white/40 uppercase tracking-tighter">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
