"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DbActor } from "@/lib/supabase/server";

const FOLDER_COLORS = ["blue", "purple", "emerald", "pink", "gray"] as const;

type ActorFolder = DbActor & {
  color: (typeof FOLDER_COLORS)[number];
  isStarred: boolean;
};

function toActorFolder(actor: DbActor, index: number): ActorFolder {
  return {
    ...actor,
    color: FOLDER_COLORS[index % FOLDER_COLORS.length],
    isStarred: false,
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function DashboardClient({ actors }: { actors: DbActor[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [folders, setFolders] = useState<ActorFolder[]>(() =>
    actors.map(toActorFolder),
  );

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

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleStarFolder = (id: string) => {
    setFolders(
      folders.map((folder) =>
        folder.id === id ? { ...folder, isStarred: !folder.isStarred } : folder,
      ),
    );
  };

  return (
    <div
      className="flex flex-col h-screen w-full bg-[#f8fafc] overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 z-20 shrink-0">
        <div className="flex items-center shrink-0 mr-4 sm:mr-8">
          <span className="text-xl font-bold text-gray-800 tracking-tight hidden md:block">
            CloudSync
          </span>
        </div>

        <div className="flex-1 max-w-3xl relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 hover:bg-gray-200/80 focus:bg-white text-gray-700 rounded-xl pl-10 pr-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm font-medium border border-transparent focus:border-blue-300 shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 ml-4 sm:ml-8 shrink-0">
          <button className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 p-2 rounded-full transition-colors relative hidden sm:block">
            <i className="fa-regular fa-bell text-lg"></i>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div className="h-9 w-9 ml-1 sm:ml-2 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm cursor-pointer shadow-sm border-2 border-white ring-2 ring-transparent hover:ring-blue-100 transition-all">
            US
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
        <div className="max-w-screen-2xl mx-auto">
          {filteredFolders.length === 0 ? (
            <div className="p-12 mt-10 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-folder-open text-4xl text-gray-300"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No folders yet
              </h3>
              <p className="text-gray-500 text-sm max-w-sm">
                {searchQuery
                  ? "No actors match your search."
                  : "No actors have been added yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredFolders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onToggleStar={() => toggleStarFolder(folder.id)}
                  onOpen={() =>
                    router.push(
                      `/file?slug=${encodeURIComponent(folder.slug)}&name=${encodeURIComponent(folder.name)}`,
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

function FolderCard({
  folder,
  onToggleStar,
  onOpen,
}: {
  folder: ActorFolder;
  onToggleStar: () => void;
  onOpen: () => void;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-500",
    purple: "text-purple-500",
    emerald: "text-emerald-500",
    pink: "text-pink-500",
    gray: "text-gray-500",
  };
  const iconColor = colorMap[folder.color] || "text-gray-500";

  return (
    <div
      onClick={onOpen}
      className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex gap-3 h-full"
    >
      <div className="shrink-0 flex items-center">
        {folder.actor_banner_imagekit_url ? (
          <img
            src={folder.actor_banner_imagekit_url}
            alt={folder.name}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
            <i
              className={`fa-solid fa-folder text-2xl sm:text-3xl ${iconColor} group-hover:scale-105 transition-transform`}
            ></i>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-bold text-gray-800 text-xs sm:text-sm truncate group-hover:text-blue-600 transition-colors"
            title={folder.name}
          >
            {folder.name}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
            }}
            className="text-gray-300 hover:text-yellow-400 p-0.5 rounded-full transition-colors shrink-0"
          >
            <i
              className={`fa-star text-sm ${folder.isStarred ? "fa-solid text-yellow-400" : "fa-regular"}`}
            ></i>
          </button>
        </div>
        <div className="flex flex-wrap items-center text-[10px] sm:text-xs text-gray-500 mt-auto pt-1">
          <span>
            {folder.video_count} {folder.video_count === 1 ? "video" : "videos"}
          </span>
          <span className="mx-1.5">·</span>
          <span>{formatDate(folder.update_at)}</span>
        </div>
      </div>
    </div>
  );
}
