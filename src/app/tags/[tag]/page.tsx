import React from 'react';
import Hanime from "@/lib/providers/hanime";
import VideoCard from "@/components/VideoCard";

export default async function TagDetailsPage({ 
  params, 
  searchParams 
}: { 
  params: { tag: string },
  searchParams: { page: string }
}) {
  const { tag } = params;
  const page = parseInt(searchParams.page || "0");
  const decodedTag = decodeURIComponent(tag);
  const provider = new Hanime();
  const videos = await provider.searchByTag(decodedTag, page + 1);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-8 bg-[#e53333] rounded-full" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-white">{decodedTag}</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">
            Transmissions tagged with {decodedTag} {page > 0 ? `(Page ${page + 1})` : ""}
          </p>
        </div>
      </div>

      {videos.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10 mb-12">
            {videos.map((video: any) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-6 py-12 border-t border-white/5">
            {page > 0 ? (
              <a 
                href={`/tags/${tag}?page=${page - 1}`}
                className="bg-white/5 border border-white/10 text-white/60 px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#e53333] hover:text-white hover:border-[#e53333] transition-all transform active:scale-95"
              >
                Previous
              </a>
            ) : (
              <span className="bg-white/5 text-white/10 px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] border border-white/5 cursor-not-allowed">
                Previous
              </span>
            )}
            
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] bg-white/5 px-6 py-2.5 rounded-full border border-white/5">
              SIGNAL {page + 1}
            </span>

            <a 
              href={`/tags/${tag}?page=${page + 1}`}
              className="bg-white/5 border border-white/10 text-white/60 px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#e53333] hover:text-white hover:border-[#e53333] transition-all transform active:scale-95"
            >
              Next
            </a>
          </div>
        </>
      ) : (
        <div className="py-20 text-center border border-white/5 bg-[#0a0a0a] rounded-3xl">
          <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em]">No transmissions found for this category</p>
          {page > 0 && (
            <a href={`/tags/${tag}?page=0`} className="mt-4 inline-block text-[#e53333] text-[10px] font-black uppercase tracking-widest hover:underline">
              Return to start
            </a>
          )}
        </div>
      )}
    </div>
  );
}
