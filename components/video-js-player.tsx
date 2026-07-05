"use client";

import { useEffect, useRef } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

type Props = { src: string };

export default function VideoJsPlayer({ src }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !src) return;

    const videoEl = document.createElement("video");
    videoEl.className = "video-js vjs-big-play-centered vjs-16-9";
    videoEl.setAttribute("playsinline", "");
    videoEl.setAttribute("webkit-playsinline", "");
    container.replaceChildren(videoEl);

    const useNativeHls = videojs.browser.IS_ANY_SAFARI || videojs.browser.IS_IOS;

    const player = videojs(videoEl, {
      controls: true,
      autoplay: false,
      preload: "auto",
      fluid: true,
      responsive: true,
      playsinline: true,
      inactivityTimeout: 3000,
      controlBar: { pictureInPictureToggle: false },
      html5: {
        vhs: {
          overrideNative: !useNativeHls,
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          useBandwidthFromLocalStorage: true,
        },
        nativeAudioTracks: useNativeHls,
        nativeVideoTracks: useNativeHls,
      },
    });

    player.src({ src, type: "application/x-mpegURL" });
    playerRef.current = player;

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className="vipvidplus-video-player w-full"
      data-vjs-player
    />
  );
}
