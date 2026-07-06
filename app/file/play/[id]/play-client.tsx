"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const OttPlayer = dynamic(() => import("@/components/ott-player"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-white animate-spin" />
    </div>
  ),
});

interface PlayClientProps {
  params: Promise<{ id: string }>;
}

export default function PlayClient({ params }: PlayClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  use(params);

  const videoName = searchParams.get("name") || "Video Player";
  const folderSlug = searchParams.get("folderSlug") || "";
  const folderName = searchParams.get("folderName") || "Folder";
  const videoSrc = searchParams.get("videoUrl") || "";

  function goBack() {
    router.push(
      `/file?slug=${encodeURIComponent(folderSlug)}&name=${encodeURIComponent(folderName)}`,
    );
  }

  return (
    <div className="w-screen h-[100dvh] bg-black overflow-hidden">
      {videoSrc ? (
        <OttPlayer src={videoSrc} title={videoName} onBack={goBack} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/50 text-sm">
          <p>Video URL not found.</p>
          <button onClick={goBack} className="text-blue-400 underline text-xs">
            Go back
          </button>
        </div>
      )}
    </div>
  );
}
