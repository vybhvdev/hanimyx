"use client";

import { useEffect, useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import VideoActions from "@/components/VideoActions";
import VideoCard from "@/components/VideoCard";
import { getUnifiedTags } from "@/lib/tags";

export default function WatchPageClient({ slug }: { slug: string }) {
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [streams, setStreams] = useState<any[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch info
        const infoRes = await fetch(`/api/info?slug=${slug}`, { cache: "no-store" });
        if (!infoRes.ok) {
          setError("Video not found");
          setLoadingInfo(false);
          setLoadingStreams(false);
          setLoadingRelated(false);
          return;
        }
        const infoData = await infoRes.json();
        setVideoInfo(infoData);
        setLoadingInfo(false);

        // Fetch streams
        fetch(`/api/streams?slug=${slug}`)
          .then((res) => res.json())
          .then((data) => {
            setStreams(data || []);
            setLoadingStreams(false);
          })
          .catch((err) => {
            console.error(err);
            setLoadingStreams(false);
          });

        // Fetch related videos based on tags
        const videoData = infoData?.hentai_video;
        const videoTags = videoData?.tags || infoData?.hentai_tags?.map((t: any) => t.text) || [];
        const relatedSearchTags = videoTags.slice(0, 3);
        
        if (relatedSearchTags.length > 0) {
          fetch("https://search.htv-services.com", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            body: JSON.stringify({
              blacklist: [],
              brands: [],
              order_by: "created_at_unix",
              page: 0,
              tags: relatedSearchTags,
              search_text: "",
              tags_mode: "OR",
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              const hits = typeof data.hits === 'string' ? JSON.parse(data.hits) : data.hits;
              const related = (hits || [])
                .filter((v: any) => v.slug !== slug)
                .slice(0, 10)
                .map((raw: any) => ({
                  id: raw.id,
                  name: raw.name,
                  slug: raw.slug,
                  posterUrl: raw.poster_url,
                  durationMs: raw.duration_in_ms,
                  tags: raw.tags,
                }));
              setRelatedVideos(related);
              setLoadingRelated(false);
            })
            .catch((err) => {
              console.error(err);
              setLoadingRelated(false);
            });
        } else {
          setLoadingRelated(false);
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load data");
        setLoadingInfo(false);
        setLoadingStreams(false);
        setLoadingRelated(false);
      }
    }

    fetchData();
  }, [slug]);

  if (error) {
    return <div className="p-8 text-center bg-[#0a0a0a] min-h-screen text-white">{error}</div>;
  }

  const videoData = videoInfo?.hentai_video;
  const videoId = videoData?.id;
  const videoTags = Array.isArray(videoData?.tags) ? videoData.tags : (Array.isArray(videoInfo?.hentai_tags) ? videoInfo.hentai_tags.map((t: any) => t.text) : []);
  const unifiedTags = videoInfo ? getUnifiedTags(videoTags) : [];
  
  const sortedStreams = (Array.isArray(streams) ? streams : []).sort((a: any, b: any) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0));
  const initialStreamUrl = sortedStreams.length > 0 ? sortedStreams[0].url : undefined;

  const rawEpisodes = videoInfo?.hentai_franchise_hentai_videos || videoInfo?.hentai_franchise?.hentai_videos || [];
  const episodes = Array.isArray(rawEpisodes) ? rawEpisodes : [];

  return (
    <div className="bg-[#0d0d0d] min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-4">
            {loadingStreams ? (
              <div className="w-full aspect-video bg-white/5 animate-pulse rounded-2xl flex items-center justify-center">
                <span className="text-white/20 uppercase tracking-[0.3em] text-[10px] font-black">Loading Player...</span>
              </div>
            ) : (
              <VideoPlayer slug={slug} videoId={videoId} initialUrl={initialStreamUrl} streams={streams} />
            )}
            
            {!loadingInfo && (
              <VideoActions 
                slug={slug} 
                title={videoInfo?.hentai_franchise?.name || videoData?.name || 'Unknown Video'} 
                streamUrl={initialStreamUrl} 
              />
            )}

            {loadingInfo ? (
              <div className="space-y-6 animate-pulse mt-8">
                <div className="h-8 bg-white/5 w-2/3 rounded"></div>
                <div className="flex gap-2"><div className="h-4 bg-white/5 w-16 rounded-full"></div><div className="h-4 bg-white/5 w-20 rounded-full"></div></div>
                <div className="h-32 bg-[#0a0a0a] border border-white/5 rounded-2xl"></div>
              </div>
            ) : videoData && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white mb-4 uppercase italic tracking-tighter leading-tight border-l-4 border-[#e53333] pl-4">
                    {videoData.name || videoInfo.hentai_franchise?.name || 'Unknown Video'}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {unifiedTags.map((tag: string) => (
                      <a 
                        key={tag} 
                        href={`/tags/${encodeURIComponent(tag.toLowerCase().replace(/ /g, "-"))}`}
                        className="text-[9px] font-black bg-white/5 border border-white/5 hover:border-[#e53333]/30 px-3 py-1 rounded-full uppercase tracking-[0.1em] text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e53333] mb-4">Description</h3>
                  <p className="text-white/40 text-sm leading-relaxed uppercase tracking-wide font-medium">
                    {videoData.description?.replace(/<[^>]*>?/gm, '') || 'No classified data available for this transmission.'}
                  </p>
                </div>

                {episodes && episodes.length > 1 && (
                  <div className="pt-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-2">
                      <div className="w-1 h-3 bg-[#e53333] rounded-full" />
                      Franchise Episodes
                    </h3>
                    <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2">
                      {episodes.map((ep: any) => (
                        <a 
                          key={ep.id} 
                          href={`/watch/hanime/${ep.slug}`}
                          className={`flex-none w-48 group bg-[#0a0a0a] border rounded-2xl transition-all overflow-hidden ${ep.slug === slug ? 'border-[#e53333]/50' : 'border-white/5 hover:border-white/10'}`}
                        >
                          <div className="relative aspect-video">
                            <img 
                              src={`/api/image?url=${encodeURIComponent(ep.poster_url)}`} 
                              alt={ep.name}
                              className={`w-full h-full object-cover transition-opacity ${ep.slug === slug ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}
                            />
                            {ep.slug === slug && <div className="absolute inset-0 bg-[#e53333]/10" />}
                          </div>
                          <div className="p-3">
                            <span className={`text-[9px] font-black uppercase tracking-widest line-clamp-1 ${ep.slug === slug ? 'text-[#e53333]' : 'text-white/40 group-hover:text-white'}`}>
                              {ep.name}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-8">
            {loadingInfo ? (
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 animate-pulse h-48"></div>
            ) : videoData && (
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                <h2 className="text-[10px] font-black text-[#e53333] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <div className="w-1 h-3 bg-[#e53333] rounded-full" />
                  Analytics
                </h2>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Views</p>
                    <p className="text-lg font-black text-white tracking-tighter">{(videoData.views || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Rating</p>
                    <p className="text-lg font-black text-white tracking-tighter">{videoData.rating || 0}/10</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Likes</p>
                    <p className="text-lg font-black text-white tracking-tighter">{(videoData.likes || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-lg font-black text-[#e53333] tracking-tighter uppercase italic">Secure</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Videos Section */}
        {loadingRelated ? (
          <section className="pt-16 border-t border-white/5 animate-pulse">
            <div className="h-8 bg-white/5 w-48 mb-10 rounded"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
               <div className="aspect-[2/3] bg-white/5 rounded-2xl"></div>
               <div className="aspect-[2/3] bg-white/5 rounded-2xl hidden sm:block"></div>
               <div className="aspect-[2/3] bg-white/5 rounded-2xl hidden lg:block"></div>
               <div className="aspect-[2/3] bg-white/5 rounded-2xl hidden xl:block"></div>
            </div>
          </section>
        ) : relatedVideos.length > 0 && (
          <section className="pt-16 border-t border-white/5">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1.5 h-8 bg-[#e53333] rounded-full" />
              <div>
                <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-white">Related Transmissions</h2>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Based on frequency: {videoTags.slice(0, 3).join(", ")}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {relatedVideos.map((video: any) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
