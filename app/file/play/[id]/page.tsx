"use client";

import React, { useEffect, useRef, useState, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

const sampleVideos: Record<string, string> = {
    m2: 'https://ik.imagekit.io/m46yip0ja/IbukuTriliunerRahasia/Ibuku%20triliuner%20rahasia1.mp4?updatedAt=1782789461973',
    m4: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    m6: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    m11: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
};

type Orientation = 'landscape' | 'portrait' | null;

function PlayerContent({ params }: PageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [orientation, setOrientation] = useState<Orientation>(null);

    // Unwrap parameters promise (Next.js 16 standard)
    const { id } = use(params);

    const videoName = searchParams.get('name') || 'Video Player';
    const folderId = searchParams.get('folderId') || 'f1';
    const folderName = searchParams.get('folderName') || 'Folder';

    const videoSrc = sampleVideos[id] || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    useEffect(() => {
        if (!document.querySelector('#google-fonts')) {
            const link = document.createElement('link');
            link.id = 'google-fonts';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
            document.head.appendChild(link);
        }
        if (!document.querySelector('#font-awesome')) {
            const link = document.createElement('link');
            link.id = 'font-awesome';
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(link);
        }
    }, []);

    // Reset orientation when video source changes
    useEffect(() => {
        setOrientation(null);
    }, [id]);

    function handleLoadedMetadata() {
        const video = videoRef.current;
        if (!video) return;
        const isPortrait = video.videoHeight > video.videoWidth;
        setOrientation(isPortrait ? 'portrait' : 'landscape');
    }

    /**
     * Video sizing strategy:
     * - Portrait  → constrain by height, let width be auto (narrow pillar)
     * - Landscape → constrain by width, let height be auto (wide bar)
     * Both respect the available space so nothing overflows.
     */
    const videoStyle: React.CSSProperties =
        orientation === 'portrait'
            ? {
                  // Portrait: fill height, auto width – keeps the pillar shape
                  height: 'calc(100vh - 4rem)',
                  width: 'auto',
                  maxWidth: '100%',
              }
            : {
                  // Landscape (default while loading too): fill width, auto height
                  width: '100%',
                  height: 'auto',
                  maxHeight: 'calc(100vh - 4rem)',
              };

    return (
        <div
            className="flex flex-col h-screen w-screen bg-black text-slate-100 overflow-hidden"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            {/* Header */}
            <header className="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 shrink-0">
                <button
                    onClick={() =>
                        router.push(
                            `/file?id=${folderId}&name=${encodeURIComponent(folderName)}`
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

            {/* Video Player */}
            <main className="flex-1 flex items-center justify-center overflow-hidden bg-black">
                <video
                    ref={videoRef}
                    key={id}
                    src={videoSrc}
                    controls
                    playsInline
                    preload="auto"
                    onLoadedMetadata={handleLoadedMetadata}
                    style={videoStyle}
                    className="object-contain shadow-2xl bg-zinc-950 focus:outline-none transition-all duration-300"
                />
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
                        Memuat pemutar video...
                    </p>
                </div>
            }
        >
            <PlayerContent params={params} />
        </Suspense>
    );
}
