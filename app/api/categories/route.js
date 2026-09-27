import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Category from "@/lib/models/Category";

export async function GET() {
  try {
    await dbConnect();

    const categories = await Category.find({
      isActive: true,
    })
      .select("name slug description image")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories",
      },
      {
        status: 500,
      },
    );
  }
}
