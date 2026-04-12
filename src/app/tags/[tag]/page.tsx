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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-12">
            {videos.map((video: any) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-6 py-8 border-t border-white/5">
            {page > 0 ? (
              <a 
                href={`/tags/${tag}?page=${page - 1}`}
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
              href={`/tags/${tag}?page=${page + 1}`}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all"
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
