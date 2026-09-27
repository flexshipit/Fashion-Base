import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import { requireAdmin } from "@/lib/auth/auth";
import Review from "@/lib/models/Review";
import Product from "@/lib/models/Product";

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;

    const body = await request.json();

    const { isApproved } = body;

    if (typeof isApproved !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "isApproved must be boolean",
        },
        {
          status: 400,
        },
      );
    }

    await dbConnect();

    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          message: "Review not found",
        },
        {
          status: 404,
        },
      );
    }

    review.isApproved = isApproved;

    await review.save();

    const stats = await Review.aggregate([
      {
        $match: {
          product: review.product,

          isApproved: true,
        },
      },

      {
        $group: {
          _id: null,

          averageRating: {
            $avg: "$rating",
          },

          reviewCount: {
            $sum: 1,
          },
        },
      },
    ]);

    await Product.updateOne(
      {
        _id: review.product,
      },
      {
        $set: {
          rating: Math.round((stats[0]?.averageRating || 0) * 10) / 10,

          reviewCount: stats[0]?.reviewCount || 0,
        },
      },
    );

    return NextResponse.json({
      success: true,

      message: "Review moderation updated",

      review,
    });
  } catch (error) {
    console.error("PATCH admin review error:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update review",
      },
      {
        status: 500,
      },
    );
  }
}
