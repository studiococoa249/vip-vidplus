import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { listVideosByActorSlug } from "@/lib/supabase/server";
import FileClient from "./file-client";

type FilePageProps = {
  searchParams: Promise<{ slug?: string; name?: string }>;
};

export async function generateMetadata({
  searchParams,
}: FilePageProps): Promise<Metadata> {
  const params = await searchParams;
  const folderName = params.name?.trim() || params.slug?.trim() || "Videos";

  return {
    title: folderName,
  };
}

async function FilePageContent({
  searchParams,
}: FilePageProps) {
  const params = await searchParams;
  const folderSlug = params.slug?.trim() ?? "";

  if (!folderSlug) {
    redirect("/dashboard");
  }

  const { actor, videos } = await listVideosByActorSlug(folderSlug);
  const folderName = params.name?.trim() || actor?.name || folderSlug;

  return (
    <FileClient
      folderSlug={folderSlug}
      folderName={folderName}
      videos={videos}
    />
  );
}

export default function FilePage({ searchParams }: FilePageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 text-sm font-medium">
            Loading videos...
          </p>
        </div>
      }
    >
      <FilePageContent searchParams={searchParams} />
    </Suspense>
  );
}
