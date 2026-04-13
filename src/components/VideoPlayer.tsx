'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  Settings, Check, RotateCcw, AlertCircle,
  SkipBack, SkipForward, Gauge
} from 'lucide-react';

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
  coverUrl?: string;
}

export default function VideoPlayer({ slug, videoId, initialUrl, streams: initialStreams, coverUrl }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const [streams, setStreams] = useState<Stream[]>(initialStreams || []);
  const [url, setUrl] = useState(initialUrl || "");
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(!initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpeedOpen, setIsSpeedOpen] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<string>("");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const togglePlay = useCallback(async () => {
    if (videoRef.current) {
      try {
        if (videoRef.current.paused) {
          await videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      } catch (err) {
        console.error("Play/Pause error:", err);
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newState = !isMuted;
      setIsMuted(newState);
      videoRef.current.muted = newState;
    }
  }, [isMuted]);

  const skip = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      }
      
      if (screen.orientation && (screen.orientation as any).lock) {
        (screen.orientation as any).lock("landscape").catch(() => {});
      }
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcut interference when typing in search
      if (document.activeElement?.tagName === 'INPUT') return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'arrowleft':
          skip(-5);
          break;
        case 'arrowright':
          skip(5);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(prev => Math.min(1, prev + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(prev => Math.max(0, prev - 0.1));
          break;
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, toggleMute, toggleFullscreen, skip]);

  // Update video volume when volume state changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  useEffect(() => {
    if (!initialUrl && (slug || videoId)) {
      fetchStreams();
    } else if (initialStreams) {
      setStreams(initialStreams);
      const sorted = [...initialStreams].sort((a, b) => parseInt(b.height as string) - parseInt(a.height as string));
      if (sorted.length > 0) {
        setCurrentQuality(sorted[0].height.toString() + 'p');
      }
    }
  }, [slug, videoId, initialUrl, initialStreams]);

  async function fetchStreams() {
    try {
      setIsFetching(true);
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
      setIsFetching(false);
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setIsSpeedOpen(false);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Sync playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, loading]);

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isSettingsOpen) setShowControls(false);
    }, 3000);
  };

  const changeQuality = (newUrl: string, quality: string) => {
    if (!videoRef.current || newUrl === url) return;
    setUrl(newUrl);
    setCurrentQuality(quality);
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    if (!url || !videoRef.current) return;
    
    const video = videoRef.current;
    let hls: Hls | null = null;
    let isDestroyed = false;

    setLoading(true);

    const startPlayback = async () => {
      if (isDestroyed || !video) return;
      try {
        setLoading(false);
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
          video.muted = true;
          setIsMuted(true);
          try {
            await video.play();
            setIsPlaying(true);
          } catch (e) {
            console.error("Muted autoplay failed:", e);
          }
        }
      }
    };

    if (Hls.isSupported()) {
      hls = new Hls({ 
        xhrSetup: (xhr) => { xhr.withCredentials = false; },
        autoStartLoad: true,
      });
      hlsRef.current = hls;
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!isDestroyed) startPlayback();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              setError("Fatal playback error");
              hls?.destroy();
              break;
          }
        }
      });

      hls.loadSource(url);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.oncanplay = () => {
        if (!isDestroyed) startPlayback();
      };
    }

    return () => {
      isDestroyed = true;
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  return (
    <div 
      ref={containerRef}
      className={`relative group aspect-video rounded-2xl overflow-hidden bg-black border border-white/5 shadow-2xl transition-all select-none ${isFullscreen ? 'rounded-none border-none w-screen h-screen' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full cursor-pointer"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onCanPlay={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onClick={togglePlay}
        playsInline
      />

      {/* Loading Spinner / Cover Backdrop */}
      {(loading || isFetching) && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
          {coverUrl && (
            <img 
              src={`/api/image?url=${encodeURIComponent(coverUrl)}`} 
              className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm"
              alt="Loading backdrop"
            />
          )}
          <div className="relative flex flex-col items-center">
            <div className="w-12 h-12 border-2 border-white/10 border-t-[#e53333] rounded-full animate-spin mb-6" />
            <div className="space-y-1 text-center">
              <p className="text-[10px] font-black tracking-[0.4em] text-white uppercase">Syncing Uplink</p>
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Establishing encrypted tunnel</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-4 md:p-6 transition-all duration-500 z-50 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        
        {/* Progress Bar */}
        <div className="relative w-full group/progress mb-4 cursor-pointer">
          <input 
            type="range" min="0" max={duration || 0} step="0.1" value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-1.5 opacity-0 cursor-pointer z-10"
          />
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#e53333] transition-all relative"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-4">
              <button onClick={() => skip(-10)} className="text-white/60 hover:text-white transition-colors">
                <SkipBack size={20} fill="currentColor" />
              </button>
              
              <button onClick={togglePlay} className="text-white hover:text-[#e53333] transition-colors transform hover:scale-110 active:scale-90">
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
              </button>

              <button onClick={() => skip(10)} className="text-white/60 hover:text-white transition-colors">
                <SkipForward size={20} fill="currentColor" />
              </button>
            </div>

            <div className="flex items-center gap-3 group/volume">
              <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input 
                type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 transition-all duration-300 accent-[#e53333] h-1 cursor-pointer"
              />
            </div>

            <div className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">
              <span className="text-white/80">{formatTime(currentTime)}</span>
              <span className="mx-2">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Speed Control */}
            <div className="relative">
              <button 
                onClick={() => { setIsSpeedOpen(!isSpeedOpen); setIsSettingsOpen(false); }}
                className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#e53333]/50 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white/70 transition-all"
              >
                <Gauge size={12} className={isSpeedOpen ? "text-[#e53333]" : ""} />
                {playbackSpeed}x
              </button>

              {isSpeedOpen && (
                <div className="absolute bottom-full right-0 mb-4 w-32 bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                  <div className="p-3 border-b border-white/5 bg-white/5">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Speed</span>
                  </div>
                  <div className="py-1">
                    {speeds.map((s) => (
                      <button
                        key={s}
                        onClick={() => changeSpeed(s)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-[9px] font-black uppercase transition-colors ${playbackSpeed === s ? 'text-[#e53333] bg-[#e53333]/5' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                      >
                        {s}x
                        {playbackSpeed === s && <Check size={10} strokeWidth={4} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quality Pill */}
            {streams.length > 1 && (
              <div className="relative">
                <button 
                  onClick={() => { setIsSettingsOpen(!isSettingsOpen); setIsSpeedOpen(false); }}
                  className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#e53333]/50 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white/70 transition-all"
                >
                  <Settings size={12} className={isSettingsOpen ? "text-[#e53333] animate-spin-slow" : ""} />
                  {currentQuality}
                </button>

                {isSettingsOpen && (
                  <div className="absolute bottom-full right-0 mb-4 w-32 bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                    <div className="p-3 border-b border-white/5 bg-white/5">
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Resolution</span>
                    </div>
                    <div className="py-1">
                      {[...streams].sort((a, b) => parseInt(b.height as string) - parseInt(a.height as string)).map((s) => (
                        <button
                          key={s.height}
                          onClick={() => changeQuality(s.url, s.height.toString() + 'p')}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-[9px] font-black uppercase transition-colors ${currentQuality === s.height.toString() + 'p' ? 'text-[#e53333] bg-[#e53333]/5' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                          {s.height}p
                          {currentQuality === s.height.toString() + 'p' && <Check size={10} strokeWidth={4} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button onClick={toggleFullscreen} className={`text-white/80 hover:text-white transition-colors transform hover:scale-110 ${isFullscreen ? 'text-[#e53333]' : ''}`}>
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Global State Overlays (Error) */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d]/95 z-[60]">
          <div className="flex flex-col items-center max-w-xs text-center">
            <AlertCircle size={40} className="text-[#e53333] mb-4 opacity-50" />
            <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.2em] mb-6 leading-relaxed">
              {error || "Carrier signal lost. Re-authentication required."}
            </p>
            <button 
              onClick={fetchStreams}
              className="group flex items-center gap-3 px-8 py-3 bg-[#e53333] hover:bg-[#ff4444] rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em] transition-all transform hover:scale-105 shadow-lg shadow-red-900/20"
            >
              <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              Reconnect
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: #fff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}
