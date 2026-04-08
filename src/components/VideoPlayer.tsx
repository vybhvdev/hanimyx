'use client';

import ReactPlayer from 'react-player';
import { useState, useEffect } from 'react';

interface VideoPlayerProps {
  slug?: string;
  videoId?: number;
}

export default function VideoPlayer({ slug, videoId }: VideoPlayerProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (slug || videoId) {
      fetchStreams();
    }
  }, [slug, videoId]);

  async function fetchStreams() {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (videoId) queryParams.set("hvId", videoId.toString());
      if (slug) queryParams.set("slug", slug);

      const response = await fetch(`/api/streams?${queryParams.toString()}`);
      if (!response.ok) throw new Error(`API error ${response.status}`);
      
      const json = await response.json();
      const streams = json.streams ?? [];
      
      if (streams.length > 0) {
        // Sort by quality descending
        const sorted = streams.sort((a: any, b: any) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0));
        setUrl(sorted[0].url);
      } else {
        setError("No playable streams found");
      }
    } catch (err: any) {
      console.error("Stream fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isMounted) return <div className="aspect-video bg-black/50 animate-pulse rounded-xl" />;

  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Loading Stream</p>
          </div>
        </div>
      )}
      {!url && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 text-sm gap-2">
          <p>{error || "No stream available"}</p>
          <button
            onClick={fetchStreams}
            className="text-[10px] font-bold bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full transition-colors"
          >
            RETRY
          </button>
        </div>
      )}
      {url && (
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
              hlsOptions: {
                xhrSetup: (xhr: any) => {
                  xhr.withCredentials = false;
                }
              }
            } 
          }}
          onError={(e) => {
            console.error("Player error:", e);
            setError("Playback error. Try retrying.");
          }}
        />
      )}
    </div>
  );
}
