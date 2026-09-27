import { NextResponse } from "next/server";

/** Map requireAuth/requireAdmin thrown errors to HTTP responses. */
export function authErrorResponse(error) {
  if (error?.message === "UNAUTHORIZED") {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  if (error?.message === "FORBIDDEN") {
    return NextResponse.json(
      { success: false, message: "Admin access required" },
      { status: 403 },
    );
  }

  return null;
}
