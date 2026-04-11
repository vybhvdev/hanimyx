'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  slug?: string;
  videoId?: number;
  initialUrl?: string;
}

export default function VideoPlayer({ slug, videoId, initialUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [url, setUrl] = useState(initialUrl || "");
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
      const queryParams = new URLSearchParams();
      if (videoId) queryParams.set("hvId", videoId.toString());
      if (slug) queryParams.set("slug", slug);

      const response = await fetch(`/api/streams?${queryParams.toString()}`);
      if (!response.ok) throw new Error(`API error ${response.status}`);
      const json = await response.json();
      const streams = json.streams ?? [];
      if (streams.length > 0) {
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

  useEffect(() => {
    if (!url || !videoRef.current) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        }
      });
      
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.error("Autoplay failed:", e));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Fatal network error encountered, try to recover");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Fatal media error encountered, try to recover");
              hls.recoverMediaError();
              break;
            default:
              console.error("Fatal error, cannot recover");
              hls.destroy();
              setError("Fatal playback error");
              break;
          }
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.error("Autoplay failed:", e));
      });
    } else {
      setError("HLS is not supported in this browser");
    }
  }, [url]);

  return (
    <div className="relative group aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
      />

      {(loading || error || !url) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
          {loading ? (
            <>
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Loading Stream</p>
            </>
          ) : (
            <>
              <p className="text-white/60 text-sm mb-4">{error || "No stream available"}</p>
              <button 
                onClick={fetchStreams}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-white transition-colors"
              >
                RETRY
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
