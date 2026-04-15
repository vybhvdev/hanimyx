import HentaiCity from "@/lib/providers/hentaicity";

const tagCovers: Record<string, string> = {
  "3d": "https://hanime-cdn.com/images/posters/gorimaccho-to-bloomers-lesson-3d.jpg",
  "ahegao": "https://hanime-cdn.com/images/posters/magical-girl-isuka-2.jpg",
  "anal": "https://hanime-cdn.com/images/posters/mugen-no-kyoukai-4-pv1.jpg",
  "bdsm": "https://hanime-cdn.com/images/posters/euphoria-1.jpg",
  "big boobs": "https://hanime-cdn.com/images/posters/virtuacall-2-pv1.png",
  "blow job": "https://hanime-cdn.com/images/posters/kan-in-no-gakuen-0-mFLBTsLjbD.jpg",
  "bondage": "https://hanime-cdn.com/images/posters/mujintou-monogatari-x-3-hUzyUsXCYa.jpg",
  "censored": "https://hanime-cdn.com/images/posters/yabai-fukushuu-yami-site-2-pv1.jpg",
  "comedy": "https://hanime-cdn.com/images/posters/nee-chanto-shiyouyo-4.jpg",
  "cosplay": "https://hanime-cdn.com/images/posters/can-can-bunny-extra-2-IvKLILPoEy.jpg",
  "creampie": "https://hanime-cdn.com/images/posters/yabai-fukushuu-yami-site-1-pv1.jpg",
  "dark skin": "https://hanime-cdn.com/images/posters/kuroinu-1.jpg",
  "facial": "https://hanime-cdn.com/images/posters/deep-voice-2-BNWWg.jpg",
  "fantasy": "https://hanime-cdn.com/images/posters/ikusa-otome-suvia-1.jpg",
  "filmed": "https://hanime-cdn.com/images/posters/bouken-shite-mo-ii-koro-2-gaoKyXekAn.jpg",
  "foot job": "https://hanime-cdn.com/images/posters/nee-chanto-shiyouyo-1.jpg",
  "gangbang": "https://hanime-cdn.com/images/posters/rin-x-sen-ran-sem-cross-mix-1.jpg",
  "glasses": "https://hanime-cdn.com/images/posters/bible-black-2.jpg",
  "hand job": "https://hanime-cdn.com/images/posters/rin-x-sen-ran-sem-cross-mix-2.jpg",
  "hd": "https://hanime-cdn.com/images/posters/bible-black-2.jpg",
  "incest": "https://hanime-cdn.com/images/posters/rin-x-sen-ran-sem-cross-mix-2.jpg",
  "lactation": "https://hanime-cdn.com/images/posters/rin-x-sen-ran-sem-cross-mix-2.jpg",
  "masturbation": "https://hanime-cdn.com/images/posters/rin-x-sen-ran-sem-cross-mix-1.jpg",
  "mind break": "https://hanime-cdn.com/images/posters/yabai-fukushuu-yami-site-1-pv1.jpg",
  "mind control": "https://hanime-cdn.com/images/posters/ikusa-otome-suvia-3.jpg",
  "monster": "https://hanime-cdn.com/images/posters/ikusa-otome-suvia-1.jpg",
  "ntr": "https://hanime-cdn.com/images/posters/hitou-meguri-kakure-yu-1.jpg",
  "nurse": "https://hanime-cdn.com/images/posters/bible-black-new-testament-3.jpg",
  "orgy": "https://hanime-cdn.com/images/posters/rin-x-sen-ran-sem-cross-mix-2.jpg",
  "plot": "https://hanime-cdn.com/images/posters/yabai-fukushuu-yami-site-1-pv1.jpg",
  "pov": "https://hanime-cdn.com/images/posters/natural-2-duo-2.png",
  "public sex": "https://hanime-cdn.com/images/posters/rin-x-sen-ran-sem-cross-mix-2.jpg",
  "school girl": "https://hanime-cdn.com/images/posters/nee-chanto-shiyouyo-4.jpg",
  "swimsuit": "https://hanime-cdn.com/images/posters/septem-charm-magical-kanan-3.png",
  "tentacle": "https://hanime-cdn.com/images/posters/ikusa-otome-suvia-1.jpg",
  "threesome": "https://hanime-cdn.com/images/posters/bible-black-only-2.jpg",
  "tsundere": "https://hanime-cdn.com/images/posters/ikusa-otome-suvia-4.jpg",
  "uncensored": "https://hanime-cdn.com/images/posters/moonlight-lady-1.jpg",
  "vanilla": "https://hanime-cdn.com/images/posters/nee-chanto-shiyouyo-4.jpg",
  "virgin": "https://hanime-cdn.com/images/posters/ikusa-otome-suvia-4.jpg",
  "x-ray": "https://hanime-cdn.com/images/posters/harem-time-1.jpg",
  "yuri": "https://hanime-cdn.com/images/posters/rin-x-sen-ran-sem-cross-mix-1.jpg"
};

export default async function TagsPage() {
  const provider = new HentaiCity();
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
        {tags.map((tag: any) => {
          const coverUrl = tagCovers[tag.text.toLowerCase()] || tag.imageUrl;
          return (
            <a 
              key={tag.id} 
              href={`/tags/${encodeURIComponent(tag.text.toLowerCase())}`}
              className="group block space-y-3"
            >
              <div className="relative aspect-square bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/5 group-hover:border-[#e53333]/50 transition-all duration-500 shadow-2xl">
                {coverUrl && (
                  <img 
                    src={`/api/image?url=${encodeURIComponent(coverUrl)}`} 
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
          );
        })}
      </div>
    </div>
  );
}
