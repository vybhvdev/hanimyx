import Hanime from "@/lib/providers/hanime";
import VideoCard from "@/components/VideoCard";

export default async function PopularPage() {
  const provider = new Hanime();
  const popularVideos = await provider.getPopular(1);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-8 bg-[#e53333] rounded-full" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-white">Popular Content</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Most viewed masterpieces</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {popularVideos.map((video: any) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
