"use client";

import React, { Suspense, use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NativeVideoPlayer from "@/components/native-video-player";
import VideoJsPlayer from "@/components/video-js-player";

interface PageProps {
  params: Promise<{ id: string }>;
}

function isHlsSource(src: string) {
  return /\.m3u8(\?|$)/i.test(src);
}

function PlayerContent({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  use(params);

  const videoName = searchParams.get("name") || "Video Player";
  const folderSlug = searchParams.get("folderSlug") || "";
  const folderName = searchParams.get("folderName") || "Folder";
  const videoSrc = searchParams.get("videoUrl") || "";

  useEffect(() => {
    if (!document.querySelector("#font-awesome")) {
      const link = document.createElement("link");
      link.id = "font-awesome";
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-black text-slate-100 overflow-hidden">
      <header className="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 shrink-0">
        <button
          onClick={() =>
            router.push(
              `/file?slug=${encodeURIComponent(folderSlug)}&name=${encodeURIComponent(folderName)}`,
            )
          }
          className="mr-4 text-zinc-400 hover:text-white p-2 rounded-full transition-colors flex items-center justify-center shrink-0"
          aria-label="Back"
        >
          <i className="fa-solid fa-arrow-left text-lg" />
        </button>
        <span className="text-white font-semibold truncate text-sm sm:text-base">
          {videoName}
        </span>
      </header>

      <main className="flex-1 overflow-hidden bg-black" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {videoSrc ? (
          isHlsSource(videoSrc) ? (
            <VideoJsPlayer src={videoSrc} />
          ) : (
            <NativeVideoPlayer src={videoSrc} />
          )
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
            Video URL not found.
          </div>
        )}
      </main>
    </div>
  );
}

export default function PlayPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex flex-col justify-center items-center text-slate-100">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-zinc-400 text-sm font-medium">Loading player…</p>
        </div>
      }
    >
      <PlayerContent params={params} />
    </Suspense>
  );
}
