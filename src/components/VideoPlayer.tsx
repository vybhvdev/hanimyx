'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  Settings, SkipBack, SkipForward, ChevronRight 
} from 'lucide-react';

interface VideoPlayerProps {
  slug?: string;
  videoId?: number;
  initialUrl?: string;
}

export default function VideoPlayer({ slug, videoId, initialUrl }: VideoPlayerProps) {
  const [url, setUrl] = useState(initialUrl || "");
  const [loading, setLoading] = useState(!initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [qualities, setQualities] = useState<{height: number, index: number}[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const seek = useCallback((amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          setIsMuted(prev => !prev);
          break;
        case 'arrowright':
          e.preventDefault();
          seek(10);
          break;
        case 'arrowleft':
          e.preventDefault();
          seek(-10);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleFullscreen, seek]);

  useEffect(() => {
    if (initialUrl) {
        setUrl(initialUrl);
        setLoading(false);
    } else if (slug || videoId) {
      fetchStreams();
    }
  }, [slug, videoId, initialUrl]);

  useEffect(() => {
    if (!url || !videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        }
      });
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels.map((l, i) => ({ height: l.height, index: i }));
        setQualities(levels.sort((a, b) => b.height - a.height));
      });

      return () => {
        hls.destroy();
      };
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = url;
    }
  }, [url]);

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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!isSettingsOpen) setShowControls(false);
    }, 3000);
  };

  return (
    <div 
      ref={containerRef}
      className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl relative group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        muted={isMuted}
        volume={volume}
        playsInline
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 flex flex-col justify-end p-4 ${showControls ? 'opacity-100' : 'opacity-0'}`}
           onClick={e => e.stopPropagation()}>
        
        {/* Progress Bar */}
        <div className="relative w-full h-1.5 bg-white/20 rounded-full mb-4 group/progress cursor-pointer overflow-hidden"
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const pos = (e.clientX - rect.left) / rect.width;
               if (videoRef.current) videoRef.current.currentTime = pos * duration;
             }}>
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500" 
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            
            <div className="flex items-center gap-2 group/volume relative">
              <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-blue-400 transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input 
                type="range" min="0" max="1" step="0.1" value={isMuted ? 0 : volume}
                onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                className="w-0 group-hover/volume:w-16 transition-all duration-300 accent-blue-500 h-1"
              />
            </div>

            <div className="text-[10px] font-black tracking-widest text-white/60">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`text-white hover:text-blue-400 transition-all ${isSettingsOpen ? 'rotate-90 text-blue-400' : ''}`}
            >
              <Settings size={20} />
            </button>

            {isSettingsOpen && (
              <div className="absolute bottom-full right-0 mb-4 bg-black/95 border border-white/10 rounded-xl p-2 w-48 backdrop-blur-xl shadow-2xl z-50">
                <div className="text-[9px] font-black text-white/30 px-2 py-1 uppercase tracking-widest mb-1">Speed</div>
                {[0.5, 1, 1.5, 2].map(speed => (
                  <button 
                    key={speed}
                    onClick={() => { setPlaybackSpeed(speed); if (videoRef.current) videoRef.current.playbackRate = speed; }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between ${playbackSpeed === speed ? 'bg-blue-600 text-white' : 'text-white/60 hover:bg-white/5'}`}
                  >
                    {speed}x
                    {playbackSpeed === speed && <ChevronRight size={12} />}
                  </button>
                ))}
                
                {qualities.length > 0 && (
                  <>
                    <div className="text-[9px] font-black text-white/30 px-2 py-1 uppercase tracking-widest mt-2 mb-1">Quality</div>
                    <button 
                      onClick={() => { setCurrentQuality(-1); hlsRef.current!.currentLevel = -1; }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between ${currentQuality === -1 ? 'bg-blue-600 text-white' : 'text-white/60 hover:bg-white/5'}`}
                    >
                      Auto
                    </button>
                    {qualities.map(q => (
                      <button 
                        key={q.index}
                        onClick={() => { setCurrentQuality(q.index); hlsRef.current!.currentLevel = q.index; }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between ${currentQuality === q.index ? 'bg-blue-600 text-white' : 'text-white/60 hover:bg-white/5'}`}
                      >
                        {q.height}p
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}

            <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition-colors">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
