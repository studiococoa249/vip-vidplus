import { NextRequest } from "next/server";

export function getRequestOrigin(request: NextRequest): string {
  const envUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();
    const proto = forwardedProto?.split(",")[0]?.trim() || "https";
    return `${proto}://${host}`;
  }

  const host = request.headers.get("host");
  if (host && !host.startsWith("localhost")) {
    const proto =
      request.headers.get("x-forwarded-proto") ||
      (request.nextUrl.protocol === "https:" ? "https" : "http");
    return `${proto}://${host}`;
  }

  return request.nextUrl.origin;
}

export function absoluteUrl(request: NextRequest, path: string): URL {
  return new URL(path, getRequestOrigin(request));
}

export function isSecureRequest(request: NextRequest): boolean {
  return (
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() === "https"
  );
}
