'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Share2, Download } from 'lucide-react';

interface VideoActionsProps {
  slug: string;
  title: string;
  streamUrl?: string;
}

export default function VideoActions({ slug, title, streamUrl }: VideoActionsProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('hanimyx_favorites') || '{}');
    setIsFavorited(!!favorites[slug]);
  }, [slug]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('hanimyx_favorites') || '{}');
    if (isFavorited) {
      delete favorites[slug];
    } else {
      favorites[slug] = { title, date: new Date().toISOString() };
    }
    localStorage.setItem('hanimyx_favorites', JSON.stringify(favorites));
    setIsFavorited(!isFavorited);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Watch ${title} on Hanimyx`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 py-4 border-b border-white/5 mb-6">
      <button 
        onClick={toggleFavorite}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${isFavorited ? 'bg-[#e53333] border-[#e53333] text-white shadow-lg shadow-red-900/20' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20'}`}
      >
        <Heart size={14} fill={isFavorited ? "currentColor" : "none"} strokeWidth={3} />
        {isFavorited ? 'Favorited' : 'Favorite'}
      </button>

      <button 
        onClick={handleShare}
        className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/10 transition-all"
      >
        <Share2 size={14} strokeWidth={3} />
        Share
      </button>

      {streamUrl && (
        <a 
          href={streamUrl}
          download={`${slug}.m3u8`}
          className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <Download size={14} strokeWidth={3} />
          Download
        </a>
      )}
    </div>
  );
}
