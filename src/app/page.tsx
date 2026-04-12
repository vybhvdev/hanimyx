import Hanime from "@/lib/providers/hanime";
import VideoCard from "@/components/VideoCard";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: { page: string } }) {
  const page = parseInt(searchParams.page || "0");
  const provider = new Hanime();
  const recentVideos = await provider.getRecent(page + 1);
  const trendingVideos = recentVideos.slice().reverse();

  return (
    <div className="space-y-12 py-8">
      {/* Hero / Recent Horizontal Section (Only on first page) */}
      {page === 0 && (
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
      )}

      {/* Main Grid */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#e53333] rounded-full" />
            <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-white">
              {page === 0 ? "Discover More" : `Page ${page + 1}`}
            </h2>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-[#e53333] hover:text-white transition-all">
              Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-12">
          {recentVideos.map((video: any) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-6 py-8 border-t border-white/5">
          {page > 0 ? (
            <a 
              href={`/?page=${page - 1}`}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all"
            >
              Previous
            </a>
          ) : (
            <span className="bg-white/5 text-white/20 px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest border border-white/5 cursor-not-allowed">
              Previous
            </span>
          )}
          
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            PAGE {page + 1}
          </span>

          <a 
            href={`/?page=${page + 1}`}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all"
          >
            Next
          </a>
        </div>
      </section>

      {/* Trending (Only on first page) */}
      {page === 0 && (
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
      )}
    </div>
  );
}
