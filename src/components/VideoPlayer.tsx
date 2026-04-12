'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  slug?: string;
  videoId?: number;
  initialUrl?: string;
}

export default function VideoPlayer({ slug, videoId, initialUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [url, setUrl] = useState(initialUrl || '');
  const [loading, setLoading] = useState(!initialUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialUrl && (slug || videoId)) {
      fetchStreams();
    }
  }, [slug, videoId, initialUrl]);

  async function fetchStreams() {
    try {
      setLoading(true);
      setError(null);
      // Always prefer slug over hvId
      const identifier = slug || videoId;
      const param = slug ? `slug=${slug}` : `hvId=${videoId}`;
      const response = await fetch(`/api/streams?${param}`);
      if (!response.ok) throw new Error(`API error ${response.status}`);
      const json = await response.json();
      const streams = json.streams ?? [];
      if (streams.length === 0) throw new Error('No streams found');
      const sorted = streams.sort((a: any, b: any) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0));
      setUrl(sorted[0].url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!url || !videoRef.current) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setError('Playback error');
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = url;
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [url]);

  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Loading Stream</p>
          </div>
        </div>
      )}
      {error && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 text-sm gap-2 z-10">
          <p>{error}</p>
          <button onClick={fetchStreams} className="text-[10px] font-bold bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full transition-colors">
            RETRY
          </button>
        </div>
      )}
      <video
        ref={videoRef}
        controls
        playsInline
        className="w-full h-full"
      />
    </div>
  );
}
