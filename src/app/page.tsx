import HentaiCity from "@/lib/providers/hentaicity";
import VideoCard from "@/components/VideoCard";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function Home({ searchParams }: { searchParams: { page: string } }) {
  const page = parseInt(searchParams.page || "0");
  const provider = new HentaiCity();
  
  const [recentVideos, trendingVideos, mangaRes] = await Promise.all([
    provider.getRecent(page + 1),
    page === 0 ? provider.getTrending(1) : Promise.resolve([]),
    page === 0 ? fetch("https://hentyx.vercel.app/api/popular", { next: { revalidate: 3600 } }).catch(() => null) : Promise.resolve(null)
  ]);

  let mangas = [];
  if (mangaRes && mangaRes.ok) {
    try {
      mangas = await mangaRes.json();
    } catch (e) {
      console.error("Failed to parse mangas", e);
    }
  }

  return (
    <div className="space-y-12 py-8">
      {/* Hero / Trending Horizontal Section (Only on first page) */}
      {page === 0 && (
        <section>
          <div className="container mx-auto px-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#e53333] rounded-full" />
              <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-white">Trending Now</h2>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-4 px-4 md:px-8 no-scrollbar pb-4 scroll-smooth">
            {trendingVideos.slice(0, 15).map((video: any) => (
              <div key={video.id} className="flex-none w-[160px] md:w-[200px]">
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
              {page === 0 ? "Recent Releases" : `Transmission Page ${page + 1}`}
            </h2>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-[#e53333] hover:text-white transition-all">
              Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10 mb-12">
          {recentVideos.map((video: any) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-6 py-12 border-t border-white/5">
          {page > 0 ? (
            <a 
              href={`/?page=${page - 1}`}
              className="bg-white/5 border border-white/10 text-white/60 px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#e53333] hover:text-white hover:border-[#e53333] transition-all transform active:scale-95"
            >
              Previous
            </a>
          ) : (
            <span className="bg-white/5 text-white/10 px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] border border-white/5 cursor-not-allowed">
              Previous
            </span>
          )}
          
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] bg-white/5 px-6 py-2.5 rounded-full border border-white/5">
            SIGNAL {page + 1}
          </span>

          <a 
            href={`/?page=${page + 1}`}
            className="bg-white/5 border border-white/10 text-white/60 px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#e53333] hover:text-white hover:border-[#e53333] transition-all transform active:scale-95"
          >
            Next
          </a>
        </div>
      </section>

      {/* Manga Section (Only on first page) */}
      {page === 0 && mangas.length > 0 && (
        <section className="bg-[#0a0a0a] py-12 border-y border-white/5">
          <div className="container mx-auto px-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#e53333] rounded-full" />
              <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-white">Manga, Doujinshi & Comics</h2>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-4 px-4 md:px-8 no-scrollbar pb-4 scroll-smooth">
            {mangas.map((manga: any) => (
              <a 
                key={manga.id} 
                href={`https://hentyx.vercel.app/gallery.html?id=${manga.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block space-y-3 flex-none w-[140px] md:w-[180px]"
              >
                <div className="relative aspect-[2/3] bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/5 group-hover:border-[#e53333]/50 transition-all duration-500 shadow-2xl">
                  <img
                    src={`/api/image?url=${encodeURIComponent(manga.cover)}`}
                    alt={manga.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#e53333]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-[#e53333] group-hover:w-full transition-all duration-500" />
                </div>
                <div className="space-y-1.5 px-1">
                  <h3 className="font-bold text-[11px] md:text-[12px] leading-snug text-white/80 group-hover:text-white uppercase tracking-tight line-clamp-2 transition-colors">
                    {manga.title}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest group-hover:text-[#e53333]/60 transition-colors">
                      DOUJINSHI
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
