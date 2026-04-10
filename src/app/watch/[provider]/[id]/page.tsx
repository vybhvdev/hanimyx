import Hanime from "@/lib/providers/hanime";
import VideoPlayer from "@/components/VideoPlayer";
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

  const videoInfo = await hanime.getInfo(slug);
  if (!videoInfo) return <div className="p-8 text-center bg-[#0a0a0a] min-h-screen text-white">Video not found</div>;

  const hvIdFromQuery = searchParams.id ? parseInt(searchParams.id) : undefined;
  const videoId = hvIdFromQuery ?? videoInfo?.hentai_video?.id;
  const videoData = videoInfo?.hentai_video;
  const unifiedTags = videoInfo ? getUnifiedTags(videoInfo.hentai_tags.map((t: any) => t.text)) : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* 
            VideoPlayer now handles manifest fetching client-side 
            using the slug/videoId to bypass Vercel IP blocking.
          */}
          <VideoPlayer slug={slug} videoId={videoId} />
          {videoData && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h1 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">
                {videoInfo.hentai_franchise?.name || 'Unknown Video'}
              </h1>
              <div className="flex flex-wrap gap-2 mb-6">
                {unifiedTags.map((tag: string) => (
                  <span key={tag} className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest text-white/80">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed border-t border-white/5 pt-6">
                {videoData.description?.replace(/<[^>]*>?/gm, '') || 'No description available.'}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-6">
          {videoData && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">STATS</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] text-white/30 uppercase">Views</p><p className="text-sm font-bold">{(videoData.views || 0).toLocaleString()}</p></div>
                <div><p className="text-[10px] text-white/30 uppercase">Rating</p><p className="text-sm font-bold">{videoData.rating || 0}/10</p></div>
                <div><p className="text-[10px] text-white/30 uppercase">Likes</p><p className="text-sm font-bold">{(videoData.likes || 0).toLocaleString()}</p></div>
                <div><p className="text-[10px] text-white/30 uppercase">Downloads</p><p className="text-sm font-bold">{(videoData.downloads || 0).toLocaleString()}</p></div>
              </div>
            </div>
          )}
          {videoInfo?.hentai_franchise_hentai_videos && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">EPISODES</h2>
              <div className="space-y-3">
                {videoInfo.hentai_franchise_hentai_videos.map((ep: any) => (
                  <a key={ep.id} href={`/watch/hanime/${ep.slug}`}
                    className={`block p-2 rounded-lg text-xs transition-colors ${ep.slug === slug ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'hover:bg-white/5 text-white/60'}`}>
                    {ep.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
