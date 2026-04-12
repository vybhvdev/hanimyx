"use client";

import { useEffect, useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import VideoActions from "@/components/VideoActions";
import VideoCard from "@/components/VideoCard";
import { getUnifiedTags } from "@/lib/tags";
import { Download } from "lucide-react";

export default function WatchPageClient({ slug }: { slug: string }) {
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [streams, setStreams] = useState<any[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch info
        const infoRes = await fetch(`/api/info?slug=${slug}`, { cache: "no-store" });
        if (!infoRes.ok) {
          setError("Video not found");
          setLoadingInfo(false);
          setLoadingStreams(false);
          setLoadingRelated(false);
          return;
        }
        const infoData = await infoRes.json();
        setVideoInfo(infoData);
        setLoadingInfo(false);

        // Fetch streams
        fetch(`/api/streams?hvId=${infoData?.hentai_video?.id || 0}`)
          .then((res) => res.json())
          .then((data) => {
            setStreams(data?.streams || []);
            setLoadingStreams(false);
          })
          .catch((err) => {
            console.error(err);
            setLoadingStreams(false);
          });

        // Fetch related videos based on tags
        const videoTags = infoData?.hentai_tags?.map((t:any) => t.text) || [];
        const relatedSearchTags = videoTags.slice(0, 3);
        
        if (relatedSearchTags.length > 0) {
          fetch("/api/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              blacklist: [],
              brands: [],
              order_by: "created_at_unix",
              page: 0,
              tags: relatedSearchTags,
              search_text: "",
              tags_mode: "OR",
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              const hits = typeof data.hits === 'string' ? JSON.parse(data.hits) : data.hits;
              const related = (hits || [])
                .filter((v: any) => v.slug !== slug)
                .slice(0, 10)
                .map((raw: any) => ({
                  id: raw.id,
                  name: raw.name,
                  slug: raw.slug,
                  posterUrl: raw.poster_url,
                  durationMs: raw.duration_in_ms,
                  tags: raw.tags,
                }));
              setRelatedVideos(related);
              setLoadingRelated(false);
            })
            .catch((err) => {
              console.error(err);
              setLoadingRelated(false);
            });
        } else {
          setLoadingRelated(false);
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load data");
        setLoadingInfo(false);
        setLoadingStreams(false);
        setLoadingRelated(false);
      }
    }

    fetchData();
  }, [slug]);

  if (error) {
    return <div className="p-8 text-center bg-[#0a0a0a] min-h-screen text-white">{error}</div>;
  }

  const videoId = videoInfo?.hentai_video?.id;
  const videoTags = videoInfo?.hentai_tags?.map((t:any)=>t.text) || [];
  const unifiedTags = videoInfo ? getUnifiedTags(videoTags) : [];
  
  const rawTitle = videoInfo?.hentai_video?.name || slug;
  const displayTitle = rawTitle.replace(/&#[Xx]([0-9A-Fa-f]+);/g, (_: string, h: string) => String.fromCharCode(parseInt(h, 16))).replace(/&#(\d+);/g, (_: string, d: string) => String.fromCharCode(parseInt(d)));
}
