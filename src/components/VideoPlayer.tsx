'use client';

interface VideoPlayerProps {
  slug?: string;
  videoId?: number;
}

export default function VideoPlayer({ slug }: VideoPlayerProps) {
  if (!slug) return (
    <div className="aspect-video bg-black/50 rounded-xl flex items-center justify-center text-white/40 text-sm">
      No video source
    </div>
  );

  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl">
      <iframe
        src={`https://hanime.tv/embed?v=${slug}`}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
