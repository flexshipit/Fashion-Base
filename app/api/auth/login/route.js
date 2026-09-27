import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit/rateLimit";
import { getClientIp } from "@/lib/rate-limit/clientIp";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
import { comparePassword } from "@/lib/utils/password";
import { generateToken } from "@/lib/auth/token";
import { mergeGuestData } from "@/lib/auth/mergeGuestData";

export async function POST(request) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is inactive",
        },
        { status: 403 },
      );
    }

    const ip = getClientIp(request);

    const limiter = await rateLimit({
      key: `login:${ip}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!limiter.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many login attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (limiter.resetAt.getTime() - Date.now()) / 1000,
            ).toString(),
          },
        },
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    const cookieStore = await cookies();
    const guestId = cookieStore.get("guestId")?.value || null;

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    });

    await mergeGuestData({
      userId: user._id,
      guestId,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.delete("guestId");
    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
