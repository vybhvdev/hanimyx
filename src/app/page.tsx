import Hanime from "@/lib/providers/hanime";
import VideoCard from "@/components/VideoCard";

export default async function Home() {
  const provider = new Hanime();
  const recentVideos = await provider.getRecent(1);
  const trendingVideos = recentVideos.slice().reverse(); // Placeholder for trending

  return (
    <div className="space-y-12 py-8">
      {/* Hero / Recent Horizontal Section */}
      <section>
        <div className="container mx-auto px-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#e53333] rounded-full" />
            <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-white">Recent Releases</h2>
          </div>
        </div>
        <div className="flex overflow-x-auto gap-4 px-4 md:px-8 no-scrollbar pb-4 scroll-smooth">
          {recentVideos.slice(0, 10).map((video: any) => (
            <div key={video.id} className="flex-none w-[280px] md:w-[320px]">
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      </section>

      {/* Main Grid */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#e53333] rounded-full" />
            <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-white">Discover More</h2>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-[#e53333] hover:text-white transition-all">
              Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {recentVideos.map((video: any) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

      {/* Trending Horizontal Section */}
      <section className="bg-[#0a0a0a] py-12 border-y border-white/5">
        <div className="container mx-auto px-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#e53333] rounded-full" />
            <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-white">Trending Now</h2>
          </div>
        </div>
        <div className="flex overflow-x-auto gap-4 px-4 md:px-8 no-scrollbar pb-4 scroll-smooth">
          {trendingVideos.slice(0, 10).map((video: any) => (
            <div key={video.id} className="flex-none w-[240px] md:w-[280px]">
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
