import Hanime from "@/lib/providers/hanime";
import VideoCard from "@/components/VideoCard";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || "";
  const provider = new Hanime();
  const videos = query ? await provider.search(query, 1) : [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-8 bg-[#e53333] rounded-full" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-white">
            {query ? `Search: ${query}` : "Discovery"}
          </h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">
            {query ? `Retrieved ${videos.length} transmissions` : "Search for specific data streams"}
          </p>
        </div>
      </div>

      {videos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
          {videos.map((video: any) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : query ? (
        <div className="py-20 text-center border border-white/5 bg-[#0a0a0a] rounded-3xl">
          <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em]">No transmissions matched your query parameters</p>
        </div>
      ) : (
        <div className="py-20 text-center border border-white/5 bg-[#0a0a0a] rounded-3xl">
          <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em]">Initiate search to retrieve content</p>
        </div>
      )}
    </div>
  );
}
