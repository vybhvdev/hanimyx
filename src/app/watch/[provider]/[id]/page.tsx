export const maxDuration = 30;
export const dynamic = "force-dynamic";

import Hanime from "@/lib/providers/hanime";
import VideoPlayer from "@/components/VideoPlayer";
import VideoActions from "@/components/VideoActions";
import VideoCard from "@/components/VideoCard";
import { getUnifiedTags } from "@/lib/tags";

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: { provider: string; id: string };
  searchParams: { id?: string };
}) {
  const { provider, id: slug } = params;
  const hanime = new Hanime();

  if (provider !== 'hanime') {
    return <div className="p-8 text-center bg-[#0a0a0a] min-h-screen text-white">Provider {provider} not yet implemented</div>;
  }

  const [videoInfo, streams] = await Promise.all([
    hanime.getInfo(slug),
    hanime.getStreams(slug)
  ]);

  if (!videoInfo) return <div className="p-8 text-center bg-[#0a0a0a] min-h-screen text-white">Video not found</div>;

  const hvIdFromQuery = searchParams.id ? parseInt(searchParams.id) : undefined;
  const videoId = hvIdFromQuery ?? videoInfo?.hentai_video?.id;
  const videoData = videoInfo?.hentai_video;
  const videoTags = videoData?.tags || videoInfo.hentai_tags?.map((t: any) => t.text) || [];
  const unifiedTags = videoInfo ? getUnifiedTags(videoTags) : [];

  // Fetch related videos by tags using OR mode
  const relatedSearchTags = videoTags.slice(0, 3);
  let relatedVideos: any[] = [];
  try {
    const relatedRes = await fetch("https://search.htv-services.com", {
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
    });
    if (relatedRes.ok) {
      const data = await relatedRes.json();
      const hits = typeof data.hits === 'string' ? JSON.parse(data.hits) : data.hits;
      relatedVideos = (hits || [])
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
    }
  } catch (e) {
    console.error("Related videos fetch error:", e);
  }

  // Sort streams by quality descending
  const sortedStreams = (streams || []).sort((a: any, b: any) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0));
  const initialStreamUrl = sortedStreams.length > 0 ? sortedStreams[0].url : undefined;

  // Find franchise episodes (checking both possible fields)
  const episodes = videoInfo.hentai_franchise_hentai_videos || videoInfo.hentai_franchise?.hentai_videos || [];

  return (
    <div className="bg-[#0d0d0d] min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayer slug={slug} videoId={videoId} initialUrl={initialStreamUrl} streams={streams} />
            
            <VideoActions 
              slug={slug} 
              title={videoInfo.hentai_franchise?.name || videoData?.name || 'Unknown Video'} 
              streamUrl={initialStreamUrl} 
            />

            {videoData && (
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

                {/* Episodes Section - Scrollable Row */}
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
            {videoData && (
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
        {relatedVideos.length > 0 && (
          <section className="pt-16 border-t border-white/5">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1.5 h-8 bg-[#e53333] rounded-full" />
              <div>
                <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-white">Related Transmissions</h2>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Based on frequency: {relatedSearchTags.join(", ")}</p>
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
