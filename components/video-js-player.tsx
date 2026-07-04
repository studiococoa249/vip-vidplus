"use client";

import { useEffect, useRef } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

function isHlsSource(src: string) {
  return /\.m3u8(\?|$)/i.test(src);
}

function getSourceType(src: string) {
  if (isHlsSource(src)) {
    return "application/x-mpegURL";
  }

  if (/\.webm(\?|$)/i.test(src)) {
    return "video/webm";
  }

  return "video/mp4";
}

type VideoJsPlayerProps = {
  src: string;
};

export default function VideoJsPlayer({ src }: VideoJsPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !src) {
      return;
    }

    const videoElement = document.createElement("video");
    videoElement.className = "video-js vjs-big-play-centered vjs-16-9";
    videoElement.setAttribute("playsinline", "true");
    videoElement.setAttribute("webkit-playsinline", "true");
    videoElement.setAttribute("x5-playsinline", "true");

    container.replaceChildren(videoElement);

    const useNativeHls =
      videojs.browser.IS_ANY_SAFARI || videojs.browser.IS_IOS;

    const player = videojs(videoElement, {
      controls: true,
      autoplay: false,
      preload: "auto",
      fluid: true,
      responsive: true,
      playsinline: true,
      fill: false,
      controlBar: {
        pictureInPictureToggle: false,
      },
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

    player.src({
      src,
      type: getSourceType(src),
    });

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
