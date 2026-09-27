import { NextResponse } from "next/server";

const GUEST_COOKIE = "guestId";

export function proxy(request) {
  if (request.cookies.get("token")?.value) {
    return NextResponse.next();
  }

  const existing = request.cookies.get(GUEST_COOKIE)?.value;
  const guestId = existing || crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-guest-id", guestId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (!existing) {
    response.cookies.set({
      name: GUEST_COOKIE,
      value: guestId,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
