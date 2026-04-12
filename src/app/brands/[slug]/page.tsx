import Hanime from "@/lib/providers/hanime";
import VideoCard from "@/components/VideoCard";

export default async function BrandDetailsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const provider = new Hanime();
  const brands = await provider.getBrands();
  const brand = brands.find((b: any) => b.slug === slug);
  const brandTitle = brand ? brand.title : slug;
  
  const videos = await provider.search(brandTitle, 1);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-8 bg-[#e53333] rounded-full" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-white">{brandTitle}</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Transmissions produced by {brandTitle}</p>
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
          <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em]">No transmissions found for this studio</p>
        </div>
      )}
    </div>
  );
}
