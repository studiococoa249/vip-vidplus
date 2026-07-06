"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type MouseEvent as RMouseEvent,
  type TouchEvent as RTouchEvent,
} from "react";

import { resolveStreamUrl, toRelayUrl } from "@/lib/stream/client";

/* ── helpers ────────────────────────────────────────────── */

type LoadMode = "direct" | "relay";

function isHls(src: string) {
  return /\.m3u8(\?|$)/i.test(src);
}

function isSafari() {
  if (typeof navigator === "undefined") return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function fmt(sec: number) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/* ── types ──────────────────────────────────────────────── */
type Props = { src: string; title?: string; onBack?: () => void };

/* ── component ──────────────────────────────────────────── */

export default function OttPlayer({ src, title, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadModeRef = useRef<LoadMode>("direct");
  const playbackUrlRef = useRef(src);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hlsRef = useRef<any>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [aspectStyle, setAspectStyle] = useState<React.CSSProperties>({
    width: "100%",
    height: "100%",
  });

  const attachMp4 = useCallback((mode: LoadMode, playbackUrl: string) => {
    const video = videoRef.current;
    if (!video || !src) return;

    loadModeRef.current = mode;
    video.removeAttribute("crossorigin");
    video.src = mode === "relay" ? toRelayUrl(src) : playbackUrl;
    video.load();
  }, [src]);

  const attachHls = useCallback((mode: LoadMode, playbackUrl: string) => {
    const video = videoRef.current;
    if (!video || !src) return;

    loadModeRef.current = mode;
    const hlsSrc = mode === "relay" ? toRelayUrl(src) : playbackUrl;

    if (isSafari() || video.canPlayType("application/vnd.apple.mpegurl")) {
      video.removeAttribute("crossorigin");
      video.src = hlsSrc;
      video.load();
      return;
    }

    import("hls.js").then(({ default: Hls }) => {
      if (!videoRef.current) return;

      if (!Hls.isSupported()) {
        videoRef.current.src = hlsSrc;
        videoRef.current.load();
        return;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
        maxBufferLength: 60,
        maxMaxBufferLength: 120,
        manifestLoadingMaxRetry: 4,
        levelLoadingMaxRetry: 4,
        fragLoadingMaxRetry: 6,
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;

        if (loadModeRef.current === "direct") {
          hls.destroy();
          hlsRef.current = null;
          attachHls("relay", playbackUrlRef.current);
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }

        setLoading(false);
        setErrored(true);
      });

      hls.loadSource(hlsSrc);
      hls.attachMedia(videoRef.current);
      hlsRef.current = hls;
    });
  }, [src]);

  const startPlayback = useCallback(async (mode: LoadMode) => {
    const playbackUrl = mode === "direct"
      ? await resolveStreamUrl(src)
      : src;

    playbackUrlRef.current = playbackUrl;

    if (isHls(src)) {
      attachHls(mode, playbackUrl);
      return;
    }

    attachMp4(mode, playbackUrl);
  }, [src, attachHls, attachMp4]);

  /* ── attach HLS or plain src ───────────────────────────── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setLoading(true);
    setErrored(false);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
    loadModeRef.current = "direct";
    playbackUrlRef.current = src;

    void startPlayback("direct");

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, startPlayback]);

  /* ── detect aspect ratio after metadata loads ──────────── */
  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    if (vh > vw) {
      // Portrait — constrain height so it doesn't overflow
      const ratio = vw / vh;
      setAspectStyle({ height: "100%", width: `calc(100% * ${ratio})`, maxWidth: "100%" });
    } else {
      // Landscape — constrain width
      const ratio = vh / vw;
      setAspectStyle({ width: "100%", height: `calc(100% * ${ratio})`, maxHeight: "100%" });
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || seeking) return;
    setCurrentTime(video.currentTime);

    // update buffered
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }
  }

  function handleError() {
    const video = videoRef.current;
    if (!video) return;

    if (loadModeRef.current === "direct") {
      setLoading(true);
      setErrored(false);
      if (isHls(src)) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        attachHls("relay", playbackUrlRef.current);
      } else {
        attachMp4("relay", playbackUrlRef.current);
      }
      return;
    }

    setLoading(false);
    setErrored(true);
  }

  function retryPlayback() {
    setErrored(false);
    setLoading(true);
    loadModeRef.current = "direct";

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    void startPlayback("direct");
  }

  /* ── controls visibility ───────────────────────────────── */
  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 3500);
  }, []);

  useEffect(() => {
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  /* ── fullscreen ────────────────────────────────────────── */
  useEffect(() => {
    function onFsChange() { setIsFullscreen(!!document.fullscreenElement); }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  /* ── play / pause ──────────────────────────────────────── */
  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  /* ── seek bar ──────────────────────────────────────────── */
  function fractionFromEvent(e: RMouseEvent<HTMLDivElement> | RTouchEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as RMouseEvent).clientX;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }

  function seekTo(fraction: number) {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = fraction * duration;
    setCurrentTime(fraction * duration);
  }

  const played = duration > 0 ? currentTime / duration : 0;
  const bufferedFrac = duration > 0 ? buffered / duration : 0;
  const controlsInteractive = showControls || !playing;

  /* ── render ────────────────────────────────────────────── */
  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none"
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
      onClick={() => { togglePlay(); resetHideTimer(); }}
    >
      {/* ── video element ──────────────────────────────────── */}
      <div
        className="flex items-center justify-center"
        style={aspectStyle}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          playsInline
          preload="auto"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
            resetHideTimer();
          }}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onWaiting={() => setLoading(true)}
          onCanPlay={() => setLoading(false)}
          onPlaying={() => { setLoading(false); setPlaying(true); }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={handleError}
          onDurationChange={() => {
            const v = videoRef.current;
            if (v && isFinite(v.duration)) setDuration(v.duration);
          }}
        />
      </div>

      {/* ── spinner ────────────────────────────────────────── */}
      {loading && !errored && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* ── error ──────────────────────────────────────────── */}
      {errored && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <svg className="w-12 h-12 text-red-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <p className="text-white/60 text-sm">Could not load video.</p>
          <button
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl transition"
            onClick={(e) => {
              e.stopPropagation();
              retryPlayback();
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── controls overlay ───────────────────────────────── */}
      <div
        className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 pointer-events-none ${showControls || !playing ? "opacity-100" : "opacity-0"}`}
        style={{ background: "linear-gradient(180deg,rgba(0,0,0,.65) 0%,transparent 22%,transparent 68%,rgba(0,0,0,.85) 100%)" }}
      >
        {/* top */}
        <div className={`flex items-center gap-3 px-4 pt-safe pt-4 ${controlsInteractive ? "pointer-events-auto" : ""}`}>
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition shrink-0"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
          )}
          {title && (
            <span className="text-white font-semibold text-sm sm:text-base truncate drop-shadow">
              {title}
            </span>
          )}
        </div>

        {/* center play icon (shows only when paused) */}
        {!playing && !errored && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              type="button"
              className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-black/50 text-white ${controlsInteractive || loading ? "pointer-events-auto" : "pointer-events-none"}`}
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
                resetHideTimer();
              }}
              aria-label="Play"
            >
              <svg className="w-8 h-8 sm:w-10 sm:h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
        )}

        {/* bottom */}
        <div
          className={`flex flex-col gap-2 px-4 pb-4 sm:pb-6 ${controlsInteractive ? "pointer-events-auto" : ""}`}
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {/* seek bar */}
          <div
            className="relative h-1.5 rounded-full bg-white/25 cursor-pointer group py-2 -my-2"
            onMouseDown={(e) => { setSeeking(true); seekTo(fractionFromEvent(e)); }}
            onMouseMove={(e) => { if (seeking) seekTo(fractionFromEvent(e)); }}
            onMouseUp={(e) => { setSeeking(false); seekTo(fractionFromEvent(e)); }}
            onMouseLeave={() => setSeeking(false)}
            onTouchStart={(e) => seekTo(fractionFromEvent(e))}
            onTouchMove={(e) => seekTo(fractionFromEvent(e))}
          >
            <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-1.5 rounded-full overflow-hidden pointer-events-none">
              <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full" style={{ width: `${bufferedFrac * 100}%` }} />
              <div className="absolute inset-y-0 left-0 bg-white rounded-full" style={{ width: `${played * 100}%` }} />
            </div>
            {/* thumb */}
            <div
              className="absolute top-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
              style={{ left: `${played * 100}%`, transform: "translate(-50%, -50%)" }}
            />
          </div>

          {/* button row */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* play / pause */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
                resetHideTimer();
              }}
              className="text-white p-1"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            {/* mute */}
            <button onClick={() => {
              const v = videoRef.current;
              if (!v) return;
              v.muted = !v.muted;
              setMuted(v.muted);
            }} className="text-white p-1" aria-label="Mute">
              {muted ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
              )}
            </button>

            {/* volume slider desktop */}
            <input
              type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
              onChange={(e) => {
                const v = videoRef.current;
                const val = Number(e.target.value);
                setVolume(val);
                if (v) { v.volume = val; v.muted = val === 0; }
                setMuted(val === 0);
              }}
              className="hidden sm:block w-20 h-1 accent-white cursor-pointer"
              aria-label="Volume"
            />

            {/* time */}
            <span className="text-white/75 text-xs sm:text-sm tabular-nums ml-1 shrink-0">
              {fmt(currentTime)} / {fmt(duration)}
            </span>

            <div className="flex-1" />

            {/* fullscreen */}
            <button onClick={toggleFullscreen} className="text-white p-1" aria-label="Fullscreen">
              {isFullscreen ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
