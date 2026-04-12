import Hanime from "@/lib/providers/hanime";

export default async function BrandsPage() {
  const provider = new Hanime();
  const brands = await provider.getBrands();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-8 bg-[#e53333] rounded-full" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-white">Production Brands</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Classified studios and labels</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {brands.map((brand: any) => (
          <a 
            key={brand.id} 
            href={`/brands/${brand.slug}`}
            className="group block p-6 bg-[#0a0a0a] rounded-2xl border border-white/5 hover:border-[#e53333]/50 transition-all duration-500 text-center shadow-2xl"
          >
            <div className="h-12 flex items-center justify-center mb-4">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.title} className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500" />
              ) : (
                <span className="text-lg font-black text-white/10 uppercase italic tracking-tighter">{brand.title.charAt(0)}</span>
              )}
            </div>
            <h2 className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover:text-white transition-colors line-clamp-1">
              {brand.title}
            </h2>
            <p className="text-[7px] font-bold text-white/10 uppercase tracking-[0.2em] mt-1 group-hover:text-[#e53333]/60 transition-colors">
              {brand.count} Videos
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
