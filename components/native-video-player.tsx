"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { resolveStreamUrl, toRelayUrl } from "@/lib/stream/client";

type LoadMode = "direct" | "relay";

type Props = { src: string };

export default function NativeVideoPlayer({ src }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadModeRef = useRef<LoadMode>("direct");
  const playbackUrlRef = useRef(src);
  const [error, setError] = useState(false);

  const attachSource = useCallback((mode: LoadMode, playbackUrl: string) => {
    const video = videoRef.current;
    if (!video) return;
    loadModeRef.current = mode;
    setError(false);
    video.src = mode === "relay" ? toRelayUrl(src) : playbackUrl;
    video.load();
  }, [src]);

  const startPlayback = useCallback(async (mode: LoadMode) => {
    const playbackUrl = mode === "direct"
      ? await resolveStreamUrl(src)
      : src;
    playbackUrlRef.current = playbackUrl;
    attachSource(mode, playbackUrl);
  }, [src, attachSource]);

  useEffect(() => {
    loadModeRef.current = "direct";
    playbackUrlRef.current = src;
    void startPlayback("direct");
  }, [src, startPlayback]);

  function handleError() {
    if (loadModeRef.current === "direct") {
      attachSource("relay", playbackUrlRef.current);
      return;
    }
    setError(true);
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      {error ? (
        <div className="flex flex-col items-center gap-3 text-zinc-400 px-6 text-center">
          <svg className="w-12 h-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <p className="text-sm">Could not load video. The server may be unavailable.</p>
          <button
            onClick={() => void startPlayback("direct")}
            className="text-xs text-blue-400 underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <video
          ref={videoRef}
          controls
          playsInline
          preload="auto"
          onError={handleError}
          className="w-full max-h-[calc(100dvh-4rem)] object-contain bg-black focus:outline-none"
          style={{ WebkitAppearance: "none" }}
        />
      )}
    </div>
  );
}
