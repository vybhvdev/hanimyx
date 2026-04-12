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
      className="group block space-y-3"
    >
      <div className="relative aspect-[2/3] bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/5 group-hover:border-[#e53333]/50 transition-all duration-500 shadow-2xl">
        <img
          src={proxiedUrl}
          alt={video.name}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
        />
        
        {/* Duration Badge */}
        {durationMin > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-tighter z-10 border border-white/10">
            {durationMin}m
          </div>
        )}

        {/* Hover Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#e53333]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Red accent bar on hover */}
        <div className="absolute bottom-0 left-0 w-0 h-1 bg-[#e53333] group-hover:w-full transition-all duration-500" />
      </div>

      <div className="space-y-1.5 px-1">
        <h3 className="font-bold text-[11px] md:text-[12px] leading-snug text-white/80 group-hover:text-white uppercase tracking-tight line-clamp-2 transition-colors">
          {video.name}
        </h3>
        <div className="flex flex-wrap gap-1">
          {unifiedTags.map(tag => (
            <span key={tag} className="text-[8px] font-black text-white/20 uppercase tracking-widest group-hover:text-[#e53333]/60 transition-colors">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
