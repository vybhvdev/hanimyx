'use client';

import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  slug?: string;
  videoId?: number;
  initialUrl?: string;
}

export default function VideoPlayer({ slug, videoId, initialUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<typeof Player | null>(null);
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current && url) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        playbackRates: [0.5, 1, 1.5, 2],
        sources: [{
          src: url,
          type: 'application/x-mpegURL'
        }],
        userActions: {
          hotkeys: true
        }
      }, () => {
        console.log('player is ready');
      });

      // Custom theme overrides
      player.on('ready', () => {
        const el = player.el();
        if (el) {
          el.style.backgroundColor = '#000';
        }
      });

    } else if (playerRef.current && url) {
        // Update source if URL changes
        playerRef.current.src({
            src: url,
            type: 'application/x-mpegURL'
        });
    }

    return () => {
      const player = playerRef.current;
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="relative group">
      <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl overflow-hidden">
        <div data-vjs-player>
          <div ref={videoRef} />
        </div>
      </div>

      {(loading || !url) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 rounded-xl">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">
            {error || "Initializing Player"}
          </p>
          {error && (
            <button 
              onClick={fetchStreams}
              className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-white transition-colors"
            >
              RETRY
            </button>
          )}
        </div>
      )}

      <style jsx global>{`
        .video-js {
          font-family: inherit;
        }
        .vjs-theme-city .vjs-big-play-button {
          background-color: rgba(59, 130, 246, 0.5);
          border-color: #3b82f6;
        }
        .vjs-control-bar {
          background-color: rgba(0, 0, 0, 0.7) !important;
          backdrop-filter: blur(8px);
        }
        .vjs-play-progress {
          background-color: #3b82f6 !important;
        }
        .vjs-slider {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        .vjs-load-progress {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }
        .vjs-load-progress div {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        .vjs-big-play-button {
          background-color: rgba(59, 130, 246, 0.2) !important;
          border: 1px solid rgba(59, 130, 246, 0.5) !important;
          backdrop-filter: blur(4px);
          width: 80px !important;
          height: 80px !important;
          line-height: 80px !important;
          border-radius: 50% !important;
        }
        .vjs-menu-button-popup .vjs-menu .vjs-menu-content {
          background-color: rgba(0, 0, 0, 0.9) !important;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
