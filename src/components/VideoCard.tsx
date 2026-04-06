import Image from "next/image";
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
  const unifiedTags = getUnifiedTags(video.tags).slice(0, 3);
  const durationMin = Math.floor(video.durationMs / 60000);

  return (
    <a 
      href={`/watch/hanime/${video.slug}`}
      className="group block bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1"
    >
      <div className="relative aspect-video overflow-hidden bg-white/5">
        <Image 
          src={video.posterUrl} 
          alt={video.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold">
          {durationMin}m
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm line-clamp-2 mb-2 text-white group-hover:text-blue-400 transition-colors">
          {video.name}
        </h3>
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {unifiedTags.map(tag => (
            <span key={tag} className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-white/60">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
