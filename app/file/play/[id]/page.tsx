import type { Metadata } from "next";
import { Suspense } from "react";
import PlayClient from "./play-client";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const videoName = params.name?.trim() || "Video Player";

  return {
    title: videoName,
  };
}

export default function PlayPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen bg-black flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        </div>
      }
    >
      <PlayClient params={params} />
    </Suspense>
  );
}
