import { NextRequest, NextResponse } from "next/server";

const PROXY_UA = "VipVidPlus-StreamProxy/1.0";

function guessContentType(url: string, upstreamType: string | null): string {
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

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Range",
  "Access-Control-Expose-Headers":
    "Content-Range, Accept-Ranges, Content-Length, Content-Type",
} as const;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 },
    );
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const rangeHeader = request.headers.get("range");

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent": PROXY_UA,
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      },
    });

    const contentType = guessContentType(
      url,
      upstream.headers.get("content-type"),
    );

    if (upstream.status === 206) {
      const headers: Record<string, string> = {
        ...CORS_HEADERS,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      };

      const cr = upstream.headers.get("content-range");
      if (cr) headers["Content-Range"] = cr;

      const cl = upstream.headers.get("content-length");
      if (cl) headers["Content-Length"] = cl;

      return new NextResponse(upstream.body, { status: 206, headers });
    }

    const cl = upstream.headers.get("content-length");
    const acceptRanges = upstream.headers.get("accept-ranges");

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": contentType,
        ...(cl ? { "Content-Length": cl } : {}),
        "Accept-Ranges": acceptRanges || "bytes",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch (err) {
    console.error("Stream proxy error:", err);
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 502 },
    );
  }
}
