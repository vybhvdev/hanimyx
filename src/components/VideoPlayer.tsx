'use client';

import ReactPlayer from 'react-player';
import { useState, useEffect } from 'react';

interface VideoPlayerProps {
  url: string;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="aspect-video bg-black/50 animate-pulse rounded-xl" />;

  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl relative">
      {!url && (
        <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
          No stream available
        </div>
      )}
      <ReactPlayer
        url={url}
        controls
        width="100%"
        height="100%"
        playing
        pip
        config={{
          file: {
            forceHLS: true,
            attributes: {
              controlsList: 'nodownload',
              // Note: Browsers handle Referer automatically based on page URL
              // but some CDNs need specific metadata
            }
          }
        }}
        onError={(e) => console.error("Video Player Error:", e)}
      />
    </div>
  );
}
