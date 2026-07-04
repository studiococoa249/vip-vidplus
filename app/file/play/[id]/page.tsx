"use client";

import React, { Suspense, use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VideoJsPlayer from "@/components/video-js-player";

interface PageProps {
  params: Promise<{ id: string }>;
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
    if (!document.querySelector("#google-fonts")) {
      const link = document.createElement("link");
      link.id = "google-fonts";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }

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
    <div
      className="flex flex-col h-[100dvh] w-screen bg-black text-slate-100 overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <header className="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 shrink-0 safe-area-top">
        <button
          onClick={() =>
            router.push(
              `/file?slug=${encodeURIComponent(folderSlug)}&name=${encodeURIComponent(folderName)}`,
            )
          }
          className="mr-4 text-zinc-400 hover:text-white p-2 rounded-full transition-colors flex items-center justify-center shrink-0"
        >
          <i className="fa-solid fa-arrow-left text-lg"></i>
        </button>
        <span className="text-white font-bold truncate text-sm sm:text-base">
          {videoName}
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center overflow-hidden bg-black px-2 sm:px-4 pb-[env(safe-area-inset-bottom)]">
        {videoSrc ? (
          <VideoJsPlayer src={videoSrc} />
        ) : (
          <p className="text-zinc-400 text-sm">Video URL not found.</p>
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
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-zinc-400 text-sm font-medium">
            Loading player...
          </p>
        </div>
      }
    >
      <PlayerContent params={params} />
    </Suspense>
  );
}
