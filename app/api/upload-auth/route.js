import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";
import config from "@/lib/config";
import { requireAdmin } from "@/lib/auth/auth";

export async function GET() {
  try {
    await requireAdmin();

    if (!config.imagekitPrivateKey || !config.imagekitPublicKey) {
      return NextResponse.json(
        {
          success: false,
          message: "ImageKit is not configured",
        },
        { status: 500 },
      );
    }

    const { token, expire, signature } = getUploadAuthParams({
      privateKey: config.imagekitPrivateKey,
      publicKey: config.imagekitPublicKey,
    });

    return NextResponse.json({
      success: true,
      token,
      expire,
      signature,
      publicKey: config.imagekitPublicKey,
    });
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 },
      );
    }

    console.error("Upload auth error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create upload auth",
      },
      { status: 500 },
    );
  }
}
