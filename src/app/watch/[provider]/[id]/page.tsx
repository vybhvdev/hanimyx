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
  const unifiedTags = videoInfo ? getUnifiedTags(videoInfo.hentai_tags.map((t: any) => t.text)) : [];

  // Fetch related videos by first tag
  const firstTag = unifiedTags[0] || "";
  const relatedVideosRaw = firstTag ? await hanime.search(firstTag, 1) : [];
  const relatedVideos = relatedVideosRaw.filter((v: any) => v.slug !== slug).slice(0, 8);

  // Sort streams by quality descending
  const sortedStreams = (streams || []).sort((a: any, b: any) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0));
  const initialStreamUrl = sortedStreams.length > 0 ? sortedStreams[0].url : undefined;

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
                    {videoInfo.hentai_franchise?.name || 'Unknown Video'}
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

                {/* Episodes Section */}
                {videoInfo?.hentai_franchise_hentai_videos && videoInfo.hentai_franchise_hentai_videos.length > 1 && (
                  <div className="pt-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-2">
                      <div className="w-1 h-3 bg-[#e53333] rounded-full" />
                      Franchise Episodes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {videoInfo.hentai_franchise_hentai_videos.map((ep: any) => (
                        <a 
                          key={ep.id} 
                          href={`/watch/hanime/${ep.slug}`}
                          className={`group flex items-center gap-4 p-3 bg-[#0a0a0a] border rounded-2xl transition-all ${ep.slug === slug ? 'border-[#e53333]/50 bg-[#e53333]/5' : 'border-white/5 hover:border-white/10 hover:bg-white/5'}`}
                        >
                          <div className="relative w-24 aspect-video rounded-lg overflow-hidden flex-none">
                            <img 
                              src={`/api/image?url=${encodeURIComponent(ep.poster_url)}`} 
                              alt={ep.name}
                              className="w-full h-full object-cover"
                            />
                            {ep.slug === slug && <div className="absolute inset-0 bg-[#e53333]/20 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full animate-ping" /></div>}
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest leading-tight line-clamp-2 ${ep.slug === slug ? 'text-[#e53333]' : 'text-white/40 group-hover:text-white'}`}>
                            {ep.name}
                          </span>
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
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Based on frequency: {firstTag}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {relatedVideos.slice(0, 6).map((video: any) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
