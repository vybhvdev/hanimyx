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
      className="group relative block aspect-video bg-black rounded-xl overflow-hidden border border-white/5 hover:border-[#e53333]/50 transition-all duration-300"
    >
      <img
        src={proxiedUrl}
        alt={video.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-80"
      />
      
      {/* Duration Badge */}
      {durationMin > 0 && (
        <div className="absolute top-2 right-2 bg-[#e53333] px-1.5 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-tighter z-10">
          {durationMin}m
        </div>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-4">
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-black text-[12px] md:text-[13px] leading-tight text-white uppercase italic tracking-tighter mb-2 line-clamp-2">
            {video.name}
          </h3>
          <div className="flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
            {unifiedTags.map(tag => (
              <span key={tag} className="text-[8px] font-black bg-white/10 px-1.5 py-0.5 rounded text-white/60 uppercase tracking-tighter">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Red accent bar on hover */}
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-[#e53333] group-hover:w-full transition-all duration-500" />
    </a>
  );
}
