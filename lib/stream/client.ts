export function toRelayUrl(src: string) {
  return `/api/stream?url=${encodeURIComponent(src)}`;
}

export async function resolveStreamUrl(src: string): Promise<string> {
  try {
    const res = await fetch(
      `/api/stream/resolve?url=${encodeURIComponent(src)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return src;
    const data = (await res.json()) as { url?: string };
    return data.url?.trim() || src;
  } catch {
    return src;
  }
}
