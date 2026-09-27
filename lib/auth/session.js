import { cookies, headers } from "next/headers";
import { randomUUID } from "crypto";

const GUEST_COOKIE = "guestId";

export async function getSessionIdentity(user = null) {
  const cookieStore = await cookies();

  const userId = user?.id || user?._id || user?.userId || null;

  if (userId) {
    return {
      type: "user",
      id: userId,
      isGuest: false,
      shouldSetCookie: false,
    };
  }

  const headerStore = await headers();
  let guestId = cookieStore.get(GUEST_COOKIE)?.value;
  let shouldSetCookie = false;

  if (!guestId) {
    guestId = headerStore.get("x-guest-id") || randomUUID();
    shouldSetCookie = true;
  }

  return {
    type: "guest",
    id: guestId,
    isGuest: true,
    shouldSetCookie,
  };
}

export function setGuestCookie(response, guestId) {
  response.cookies.set({
    name: GUEST_COOKIE,
    value: guestId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
