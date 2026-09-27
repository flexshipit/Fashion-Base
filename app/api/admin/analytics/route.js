import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import { requireAdmin } from "@/lib/auth/auth";
import { getDashboardAnalytics } from "@/lib/analytics/analytics";

export async function GET() {
  try {
    await dbConnect();

    await requireAdmin();

    const analytics = await getDashboardAnalytics();

    return NextResponse.json({
      analytics,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { message: "Failed to load analytics" },
      { status: 500 },
    );
  }
}
