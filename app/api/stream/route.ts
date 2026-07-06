import { NextRequest, NextResponse } from "next/server";
import {
  guessContentType,
  isAllowedStreamUrl,
  resolveFinalUrl,
  STREAM_CORS_HEADERS,
  upstreamFetch,
} from "@/lib/stream/upstream";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: STREAM_CORS_HEADERS });
}

export async function HEAD(request: NextRequest) {
  return GET(request);
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 },
    );
  }

  if (!isAllowedStreamUrl(url)) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const rangeHeader = request.headers.get("range");
  const isHead = request.method === "HEAD";

  try {
    const targetUrl = await resolveFinalUrl(url);

    const upstream = await upstreamFetch(targetUrl, {
      method: isHead ? "HEAD" : "GET",
      redirect: "follow",
      headers: {
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      },
    });

    const contentType = guessContentType(
      targetUrl,
      upstream.headers.get("content-type"),
    );

    if (!upstream.ok && upstream.status !== 206) {
      return new NextResponse(null, {
        status: upstream.status,
        headers: STREAM_CORS_HEADERS,
      });
    }

    if (upstream.status === 206) {
      const headers: Record<string, string> = {
        ...STREAM_CORS_HEADERS,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      };

      const cr = upstream.headers.get("content-range");
      if (cr) headers["Content-Range"] = cr;

      const cl = upstream.headers.get("content-length");
      if (cl) headers["Content-Length"] = cl;

      return new NextResponse(isHead ? null : upstream.body, {
        status: 206,
        headers,
      });
    }

    const cl = upstream.headers.get("content-length");
    const acceptRanges = upstream.headers.get("accept-ranges");

    return new NextResponse(isHead ? null : upstream.body, {
      status: upstream.status,
      headers: {
        ...STREAM_CORS_HEADERS,
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
