import { getUnifiedTags } from "@/lib/tags";

interface VideoCardProps {
  video: {
    id: number | string;
    name: string;
    slug: string;
    posterUrl: string;
    coverUrl?: string;
    tags: string[];
    durationMs: number;
    brand: string;
    trailerUrl?: string;
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  const unifiedTags = getUnifiedTags(video.tags).slice(0, 2);
  const durationMin = Math.floor((video.durationMs || 0) / 60000);
  const imageUrl = video.coverUrl || video.posterUrl;
  const proxiedUrl = imageUrl ? `/api/image?url=${encodeURIComponent(imageUrl)}` : "";

  return (
    <a
      href={`/watch/hentaicity/${video.slug}?id=${video.id}`}
      className="group block space-y-3"
    >
      <div className="relative aspect-[2/3] bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/5 group-hover:border-[#e53333]/50 transition-all duration-500 shadow-2xl">
        <img
          src={proxiedUrl}
          alt={video.name}
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 z-0"
        />
        
        {video.trailerUrl && (
          <video 
            src={video.trailerUrl} 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"
            onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
            onMouseOut={(e) => {
              const el = e.target as HTMLVideoElement;
              el.pause();
              el.currentTime = 0;
            }}
          />
        )}
        
        {/* Duration Badge */}
        {durationMin > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-tighter z-20 border border-white/10">
            {durationMin}m
          </div>
        )}

        {/* Hover Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#e53333]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />
        
        {/* Red accent bar on hover */}
        <div className="absolute bottom-0 left-0 w-0 h-1 bg-[#e53333] group-hover:w-full transition-all duration-500 z-20" />
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
