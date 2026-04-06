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
    <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl">
      <ReactPlayer
        url={url}
        controls
        width="100%"
        height="100%"
        playing
        pip
        stopOnTerminate={false}
      />
    </div>
  );
}
