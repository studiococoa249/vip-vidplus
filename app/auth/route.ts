import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { resolveUserToken } from "@/lib/auth/resolve-token";
import { findUserByToken } from "@/lib/supabase/server";
import { absoluteUrl, isSecureRequest } from "@/lib/url/origin";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const userToken = resolveUserToken(params);

  if (!userToken) {
    return NextResponse.redirect(absoluteUrl(request, "/"));
  }

  const user = await findUserByToken(userToken);

  if (!user) {
    return NextResponse.redirect(absoluteUrl(request, "/"));
  }

  if (user.membership === "Free") {
    return NextResponse.redirect(absoluteUrl(request, "/error"));
  }

  const response = NextResponse.redirect(absoluteUrl(request, "/dashboard"));

  response.cookies.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    secure: isSecureRequest(request),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
