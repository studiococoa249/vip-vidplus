"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActorVideoFile } from "@/lib/supabase/server";

type VideoItem = ActorVideoFile & {
  isStarred: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function FileClient({
  folderSlug,
  folderName,
  videos,
}: {
  folderSlug: string;
  folderName: string;
  videos: ActorVideoFile[];
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState<VideoItem[]>(() =>
    videos.map((video) => ({ ...video, isStarred: false })),
  );

  useEffect(() => {
    setFiles(videos.map((video) => ({ ...video, isStarred: false })));
  }, [videos]);

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

  const toggleStarFile = (id: string) => {
    setFiles(
      files.map((file) =>
        file.id === id ? { ...file, isStarred: !file.isStarred } : file,
      ),
    );
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className="flex flex-col h-screen w-full bg-[#f8fafc] overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 sm:px-8 z-20 shrink-0">
        <button
          onClick={() => router.push("/dashboard")}
          className="mr-3 sm:mr-4 text-gray-500 hover:bg-gray-100 hover:text-gray-700 p-2 rounded-full transition-colors flex items-center justify-center"
        >
          <i className="fa-solid fa-arrow-left text-lg"></i>
        </button>
        <div className="flex items-center shrink-0 mr-4 sm:mr-8">
          <span className="text-base sm:text-xl font-bold text-gray-800 tracking-tight truncate max-w-[120px] sm:max-w-none">
            {folderName}
          </span>
        </div>

        <div className="flex-1 max-w-3xl relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 hover:bg-gray-200/80 focus:bg-white text-gray-700 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm font-medium border border-transparent focus:border-blue-300 shadow-sm"
          />
        </div>

        <div className="flex items-center ml-4 shrink-0">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm cursor-pointer shadow-sm border-2 border-white ring-2 ring-transparent hover:ring-blue-100 transition-all">
            US
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">
                All Videos
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Videos from {folderName}
              </p>
            </div>
            <div className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100">
              {filteredFiles.length}{" "}
              {filteredFiles.length === 1 ? "video" : "videos"}
            </div>
          </div>

          {!folderSlug ? (
            <EmptyState message="Actor slug is missing." />
          ) : filteredFiles.length === 0 ? (
            <EmptyState
              message={
                searchQuery
                  ? "No videos match your search."
                  : "No videos have been added for this actor yet."
              }
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onToggleStar={() => toggleStarFile(file.id)}
                  onPlay={() =>
                    router.push(
                      `/file/play/${file.id}?name=${encodeURIComponent(file.name)}&videoUrl=${encodeURIComponent(file.videoUrl)}&folderSlug=${encodeURIComponent(folderSlug)}&folderName=${encodeURIComponent(folderName)}`,
                    )
                  }
                />
              ))}
            </div>
          )}

          <div className="h-12"></div>
        </div>
      </main>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-12 mt-10 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <i className="fa-solid fa-file-circle-exclamation text-4xl text-gray-300"></i>
      </div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">No videos</h3>
      <p className="text-gray-500 text-sm max-w-sm">{message}</p>
    </div>
  );
}

function FileCard({
  file,
  onToggleStar,
  onPlay,
}: {
  file: VideoItem;
  onToggleStar: () => void;
  onPlay: () => void;
}) {
  return (
    <div
      onClick={onPlay}
      className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col h-full relative"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar();
        }}
        className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 text-gray-300 hover:text-yellow-400 p-1.5 rounded-full transition-colors z-10 bg-white/80 backdrop-blur-sm shadow-sm"
      >
        <i
          className={`fa-star ${file.isStarred ? "fa-solid text-yellow-400" : "fa-regular"}`}
        ></i>
      </button>

      <div className="aspect-[4/3] rounded-lg sm:rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-[1.02] bg-blue-50 text-blue-500">
        <div className="relative">
          <i className="fa-regular fa-circle-play text-3xl sm:text-4xl"></i>
          <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
            <i className="fa-solid fa-play text-[8px]"></i>
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <h3
          className="font-bold text-gray-800 text-xs sm:text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors"
          title={file.name}
        >
          {file.name}
        </h3>
        <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-50 text-[10px] sm:text-xs text-gray-500">
          <span>Video</span>
          <span className="hidden sm:inline">{formatDate(file.modified)}</span>
        </div>
      </div>
    </div>
  );
}
