import Hanime from "@/lib/providers/hanime";

export default async function TagsPage() {
  const provider = new Hanime();
  const tags = await provider.getTags();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-8 bg-[#e53333] rounded-full" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-white">Categories</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Explore by transmission type</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
        {tags.map((tag: any) => (
          <a 
            key={tag.id} 
            href={`/tags/${encodeURIComponent(tag.text.toLowerCase())}`}
            className="group block space-y-3"
          >
            <div className="relative aspect-square bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/5 group-hover:border-[#e53333]/50 transition-all duration-500 shadow-2xl">
              {tag.imageUrl && (
                <img 
                  src={tag.imageUrl} 
                  alt={tag.text}
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                />
              )}
              {/* Red accent bar on hover */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-[#e53333] group-hover:w-full transition-all duration-500" />
            </div>
            <div className="text-center">
              <h2 className="text-xs font-black text-white/60 uppercase tracking-widest group-hover:text-[#e53333] transition-colors">
                {tag.text}
              </h2>
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">
                {tag.count.toLocaleString()} videos
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
