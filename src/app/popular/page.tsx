import Hanime from "@/lib/providers/hanime";
import VideoCard from "@/components/VideoCard";

export default async function PopularPage({ searchParams }: { searchParams: { page: string } }) {
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
      <div className="flex items-center justify-center gap-6 py-8 border-t border-white/5">
        {page > 0 ? (
          <a 
            href={`/popular?page=${page - 1}`}
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
          href={`/popular?page=${page + 1}`}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all"
        >
          Next
        </a>
      </div>
    </div>
  );
}
