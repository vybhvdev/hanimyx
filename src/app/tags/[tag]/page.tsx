import Hanime from "@/lib/providers/hanime";
import VideoCard from "@/components/VideoCard";

export default async function TagDetailsPage({ params }: { params: { tag: string } }) {
  const { tag } = params;
  const decodedTag = decodeURIComponent(tag);
  const provider = new Hanime();
  const videos = await provider.searchByTag(decodedTag, 1);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-8 bg-[#e53333] rounded-full" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-white">{decodedTag}</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Transmissions tagged with {decodedTag}</p>
        </div>
      </div>

      {videos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {videos.map((video: any) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-white/5 bg-[#0a0a0a] rounded-3xl">
          <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em]">No transmissions found for this category</p>
        </div>
      )}
    </div>
  );
}
