'use client';

import ReactPlayer from 'react-player';
import { useState, useEffect } from 'react';

interface VideoPlayerProps {
  videoId?: number;
  initialUrl?: string;
}

export default function VideoPlayer({ videoId, initialUrl }: VideoPlayerProps) {
  const [url, setUrl] = useState(initialUrl || "");
  const [loading, setLoading] = useState(!!videoId && !initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (videoId && !initialUrl) {
      fetchStreams(videoId);
    }
  }, [videoId, initialUrl]);

  async function fetchStreams(id: number) {
    try {
      setLoading(true);
      const ts = Math.floor(Date.now() / 1000).toString();
      const secret = "865473ac43246402343d6433337a4330";
      
      // Web Crypto HMAC-SHA256
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const msgData = encoder.encode(ts);
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
      );
      const signatureBuffer = await window.crypto.subtle.sign("HMAC", cryptoKey, msgData);
      const signature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const response = await fetch(
        `https://cached.freeanimehentai.net/api/v8/guest/videos/${id}/manifest`,
        {
          headers: {
            "Accept": "application/json, text/plain, */*",
            "x-signature": signature,
            "x-signature-version": "web2",
            "x-time": ts,
            "Referer": "https://hanime.tv/",
            "Origin": "https://hanime.tv",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch stream manifest");
      const json = await response.json();
      const streams = (json?.videos_manifest?.servers ?? [])
        .flatMap((s: any) => s.streams)
        .filter((st: any) => st.kind !== "premium_alert" && st.url);

      if (streams.length > 0) {
        // Pick best quality
        const sorted = streams.sort((a: any, b: any) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0));
        setUrl(sorted[0].url);
      } else {
        setError("No playable streams found");
      }
    } catch (err: any) {
      console.error("Client-side stream fetch error:", err);
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
            onClick={() => videoId && fetchStreams(videoId)}
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
            }
          }}
          onError={(e) => {
              console.error("Video Player Error:", e);
              setError("Playback error. The CDN might be blocking this request.");
          }}
        />
      )}
    </div>
  );
}
