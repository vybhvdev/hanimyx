import Hanime from "@/lib/providers/hanime";
import VideoCard from "@/components/VideoCard";

export default async function Home() {
  const provider = new Hanime();
  const recentVideos = await provider.getRecent(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">RECENT RELEASES</h1>
          <p className="text-white/40 text-sm">Latest updates from Hanime</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-white/10 transition-colors">
            FILTER
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recentVideos.map((video: any) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
