import { NextRequest, NextResponse } from "next/server";
import {
  isAllowedStreamUrl,
  resolveFinalUrl,
  STREAM_CORS_HEADERS,
} from "@/lib/stream/upstream";

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

  try {
    const resolved = await resolveFinalUrl(url);
    return NextResponse.json(
      { url: resolved },
      {
        headers: {
          ...STREAM_CORS_HEADERS,
          "Cache-Control": "public, max-age=600, stale-while-revalidate=300",
        },
      },
    );
  } catch (err) {
    console.error("Stream resolve error:", err);
    return NextResponse.json(
      { url },
      {
        headers: {
          ...STREAM_CORS_HEADERS,
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
