'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Settings, ChevronUp, Check } from 'lucide-react';

interface Stream {
  id: string | number;
  url: string;
  height: string | number;
}

interface VideoPlayerProps {
  slug?: string;
  videoId?: number;
  initialUrl?: string;
  streams?: Stream[];
}

export default function VideoPlayer({ slug, videoId, initialUrl, streams: initialStreams }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [streams, setStreams] = useState<Stream[]>(initialStreams || []);
  const [url, setUrl] = useState(initialUrl || "");
  const [loading, setLoading] = useState(!initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<string>("");

  useEffect(() => {
    if (!initialUrl && (slug || videoId)) {
      fetchStreams();
    } else if (initialStreams) {
      setStreams(initialStreams);
      const sorted = initialStreams.sort((a, b) => parseInt(b.height as string) - parseInt(a.height as string));
      if (sorted.length > 0) {
        setCurrentQuality(sorted[0].height.toString() + 'p');
      }
    }
  }, [slug, videoId, initialUrl, initialStreams]);

  async function fetchStreams() {
    try {
      setLoading(true);
      setError(null);
      const param = slug ? `slug=${slug}` : `hvId=${videoId}`;
      const response = await fetch(`/api/streams?${param}`);
      if (!response.ok) throw new Error(`API error ${response.status}`);
      const json = await response.json();
      const fetchedStreams = json.streams ?? [];
      setStreams(fetchedStreams);
      
      if (fetchedStreams.length > 0) {
        const sorted = fetchedStreams.sort((a: any, b: any) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0));
        setUrl(sorted[0].url);
        setCurrentQuality((sorted[0].height || "720").toString() + 'p');
      } else {
        setError("No playable streams found");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const changeQuality = (newUrl: string, quality: string) => {
    if (!videoRef.current || newUrl === url) return;
    
    const currentTime = videoRef.current.currentTime;
    const isPaused = videoRef.current.paused;
    
    setUrl(newUrl);
    setCurrentQuality(quality);
    setIsSettingsOpen(false);

    // After URL state updates, the second useEffect will handle hls.loadSource
    // We need to preserve the time. We can use a ref or an effect for this.
    const handleSeek = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
        if (!isPaused) videoRef.current.play();
        videoRef.current.removeEventListener('loadedmetadata', handleSeek);
      }
    };
    videoRef.current.addEventListener('loadedmetadata', handleSeek);
  };

  useEffect(() => {
    if (!url || !videoRef.current) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      if (hlsRef.current) hlsRef.current.destroy();
      
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        }
      });
      
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Only autoplay on first load, not necessarily on quality change if it was paused
        // but the changeQuality handler handles resume if it was playing.
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
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
      video.src = url;
    }
  }, [url]);

  return (
    <div className="relative group aspect-video rounded-xl overflow-hidden bg-black border border-white/5 shadow-2xl shadow-red-900/5">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
      />

      {/* Quality Selector UI */}
      {streams.length > 1 && !loading && !error && (
        <div className="absolute bottom-12 right-2 z-20">
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(!isSettingsOpen); }}
              className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/5 hover:bg-black/60 hover:border-white/20 px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white/70 transition-all shadow-xl"
            >
              <Settings size={12} className={isSettingsOpen ? "text-[#e53333] animate-spin-slow" : ""} />
              {currentQuality}
            </button>

            {isSettingsOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-28 bg-[#0d0d0d]/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                <div className="p-2 border-b border-white/5 bg-white/5">
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20">Quality</span>
                </div>
                <div className="py-1">
                  {streams.sort((a, b) => parseInt(b.height as string) - parseInt(a.height as string)).map((s) => (
                    <button
                      key={s.height}
                      onClick={() => changeQuality(s.url, s.height.toString() + 'p')}
                      className={`w-full flex items-center justify-between px-3 py-2 text-[9px] font-black uppercase transition-colors ${currentQuality === s.height.toString() + 'p' ? 'text-[#e53333] bg-[#e53333]/5' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                    >
                      {s.height}p
                      {currentQuality === s.height.toString() + 'p' && <Check size={8} strokeWidth={4} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {(loading || error || !url) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d]/90 z-30">
          {loading ? (
            <>
              <div className="w-12 h-12 border-2 border-[#e53333]/20 border-t-[#e53333] rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">Establishing Secure Connection</p>
            </>
          ) : (
            <>
              <p className="text-white/60 text-[11px] font-black uppercase tracking-widest mb-4">{error || "Signal Interrupted"}</p>
              <button 
                onClick={fetchStreams}
                className="px-6 py-2 bg-[#e53333] hover:bg-[#ff4444] rounded-full text-[10px] font-black text-white uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95"
              >
                Reconnect
              </button>
            </>
          )}
        </div>
      )}

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
