import Hanime from "@/lib/providers/hanime";
import VideoCard from "@/components/VideoCard";

export default async function PopularPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams.page || "0");
  const provider = new Hanime();
  const popularVideos = await provider.getPopular(page + 1);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-8 bg-[#e53333] rounded-full" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-white">Popular Content</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Most viewed masterpieces</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-12">
        {popularVideos.map((video: any) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 py-8 border-t border-white/5">
        <a 
          href={page > 0 ? `/popular?page=${page - 1}` : "#"}
          className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${page > 0 ? 'bg-white/5 text-white hover:bg-[#e53333]' : 'opacity-20 pointer-events-none text-white/40 border border-white/10'}`}
        >
          Previous
        </a>
        <span className="text-[10px] font-black text-[#e53333] bg-[#e53333]/10 px-4 py-2 rounded-full">
          {page + 1}
        </span>
        <a 
          href={`/popular?page=${page + 1}`}
          className="px-6 py-2 bg-white/5 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#e53333] transition-all"
        >
          Next
        </a>
      </div>
    </div>
  );
}
