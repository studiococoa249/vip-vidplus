import { readFileSync } from "fs";
import { join } from "path";
import {
  fetch as undiciFetch,
  ProxyAgent,
  type Dispatcher,
} from "undici";

const PROXY_UA = "VipVidPlus-StreamProxy/1.0";
const MAX_REDIRECTS = 8;
const RESOLVE_CACHE_TTL_MS = 10 * 60 * 1000;

const resolvedCache = new Map<string, { url: string; expires: number }>();

type ProxyEntry = { proxy?: string };

type ProxySlot = {
  id: string;
  dispatcher: Dispatcher;
};

let proxyPool: ProxySlot[] = [];
let proxyPoolLoadedAt = 0;
let proxyRoundRobin = 0;
const PROXY_POOL_RELOAD_MS = 30_000;

function proxySlotId(proxyUrl: string) {
  return proxyUrl;
}

function buildProxyUrl(parsed: {
  host: string;
  port: number;
  user: string;
  pass: string;
}) {
  const auth =
    parsed.user && parsed.pass
      ? `${encodeURIComponent(parsed.user)}:${encodeURIComponent(parsed.pass)}@`
      : "";
  return `http://${auth}${parsed.host}:${parsed.port}`;
}

function loadProxyPool(): ProxySlot[] {
  const now = Date.now();
  if (proxyPool.length > 0 && now - proxyPoolLoadedAt < PROXY_POOL_RELOAD_MS) {
    return proxyPool;
  }

  const proxies = loadProxyList();
  const nextPool: ProxySlot[] = [];

  for (const entry of proxies) {
    const parsed = parseProxy(entry);
    if (!parsed || !parsed.port) continue;

    const proxyUrl = buildProxyUrl(parsed);
    nextPool.push({
      id: proxySlotId(proxyUrl),
      dispatcher: new ProxyAgent(proxyUrl),
    });
  }

  proxyPool = nextPool;
  proxyPoolLoadedAt = now;

  if (proxyRoundRobin >= proxyPool.length) {
    proxyRoundRobin = 0;
  }

  return proxyPool;
}

function pickProxyOrder(): ProxySlot[] {
  const pool = loadProxyPool();
  if (pool.length === 0) return [];

  const start = proxyRoundRobin % pool.length;
  proxyRoundRobin = (proxyRoundRobin + 1) % pool.length;

  const ordered: ProxySlot[] = [];
  for (let i = 0; i < pool.length; i++) {
    ordered.push(pool[(start + i) % pool.length]);
  }

  return ordered;
}

function loadProxyList(): string[] {
  try {
    const file = join(process.cwd(), "app", "data", "proxy.json");
    const raw = readFileSync(file, "utf8");
    const entries = JSON.parse(raw) as ProxyEntry[];
    return entries
      .map((entry) => entry.proxy?.trim())
      .filter((value): value is string => Boolean(value));
  } catch {
    return [];
  }
}

function parseProxy(value: string) {
  const parts = value.split(":");
  if (parts.length < 2) return null;

  if (parts.length === 2) {
    const [host, port] = parts;
    return { host, port: Number(port), user: "", pass: "" };
  }

  const [host, port, user, ...rest] = parts;
  return {
    host,
    port: Number(port),
    user: user ?? "",
    pass: rest.join(":"),
  };
}

function isRetryableProxyError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("fetch failed") ||
    message.includes("econnrefused") ||
    message.includes("econnreset") ||
    message.includes("etimedout") ||
    message.includes("socket") ||
    message.includes("proxy")
  );
}

async function fetchViaProxy(
  url: string,
  init: RequestInit,
  dispatcher: Dispatcher,
): Promise<Response> {
  return undiciFetch(url, {
    method: init.method,
    headers: init.headers as Record<string, string>,
    redirect: init.redirect,
    signal: init.signal,
    dispatcher,
  }) as unknown as Promise<Response>;
}

export function guessContentType(url: string, upstreamType: string | null): string {
  if (upstreamType && upstreamType.startsWith("video/")) {
    return upstreamType;
  }

  const path = url.split("?")[0].toLowerCase();
  if (path.endsWith(".mp4") || path.endsWith(".m4v")) return "video/mp4";
  if (path.endsWith(".webm")) return "video/webm";
  if (path.endsWith(".ogg") || path.endsWith(".ogv")) return "video/ogg";
  if (path.endsWith(".mov")) return "video/quicktime";
  if (path.endsWith(".mkv")) return "video/x-matroska";
  if (path.endsWith(".ts")) return "video/mp2t";
  if (path.endsWith(".m3u8")) return "application/x-mpegURL";

  return "video/mp4";
}

export function upstreamHeaders(url: string): Record<string, string> {
  let referer = "";
  try {
    referer = new URL(url).origin + "/";
  } catch {
    // ignore invalid URLs
  }

  return {
    "User-Agent": PROXY_UA,
    Accept: "video/*,application/vnd.apple.mpegurl,application/x-mpegURL,*/*;q=0.8",
    ...(referer ? { Referer: referer } : {}),
  };
}

export function isAllowedStreamUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function upstreamFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = {
    ...upstreamHeaders(url),
    ...(init.headers as Record<string, string> | undefined),
  };
  const requestInit = { ...init, headers };
  const proxyOrder = pickProxyOrder();

  if (proxyOrder.length === 0) {
    return fetch(url, requestInit);
  }

  let lastError: unknown;

  for (let i = 0; i < proxyOrder.length; i++) {
    try {
      const response = await fetchViaProxy(
        url,
        requestInit,
        proxyOrder[i].dispatcher,
      );

      if (response.status >= 500 && i < proxyOrder.length - 1) {
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (isRetryableProxyError(error) && i < proxyOrder.length - 1) {
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All proxies failed");
}

export async function resolveFinalUrl(originalUrl: string): Promise<string> {
  const cached = resolvedCache.get(originalUrl);
  if (cached && cached.expires > Date.now()) {
    return cached.url;
  }

  let current = originalUrl;

  for (let i = 0; i < MAX_REDIRECTS; i++) {
    const res = await upstreamFetch(current, {
      method: "HEAD",
      redirect: "manual",
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) break;
      current = new URL(location, current).href;
      continue;
    }

    if (res.status === 405 || res.status === 501 || res.status === 403) {
      const probe = await upstreamFetch(current, {
        method: "GET",
        redirect: "manual",
        headers: {
          Range: "bytes=0-0",
        },
      });

      if (probe.status >= 300 && probe.status < 400) {
        const location = probe.headers.get("location");
        if (!location) break;
        current = new URL(location, current).href;
        continue;
      }

      if (probe.body) {
        await probe.body.cancel();
      }
    }

    resolvedCache.set(originalUrl, {
      url: current,
      expires: Date.now() + RESOLVE_CACHE_TTL_MS,
    });
    return current;
  }

  resolvedCache.set(originalUrl, {
    url: current,
    expires: Date.now() + RESOLVE_CACHE_TTL_MS,
  });
  return current;
}

export const STREAM_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Range",
  "Access-Control-Expose-Headers":
    "Content-Range, Accept-Ranges, Content-Length, Content-Type",
} as const;
