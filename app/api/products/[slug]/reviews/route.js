import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import { getAuthUser } from "@/lib/auth/auth";
import Product from "@/lib/models/Product";
import Order from "@/lib/models/Order";
import Review from "@/lib/models/Review";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    await dbConnect();

    const product = await Product.findOne({
      slug,
      isActive: true,
    })
      .select("_id")
      .lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        {
          status: 404,
        },
      );
    }

    const reviews = await Review.find({
      product: product._id,

      isApproved: true,
    })
      .populate("user", "name avatar")
      .sort({
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("GET reviews error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reviews",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request, { params }) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Login is required to review a product",
        },
        {
          status: 401,
        },
      );
    }

    const { slug } = await params;

    const body = await request.json();

    const rating = Number(body.rating);

    const title = typeof body.title === "string" ? body.title.trim() : "";

    const comment = typeof body.comment === "string" ? body.comment.trim() : "";

    const orderNumber =
      typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5",
        },
        {
          status: 400,
        },
      );
    }

    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          message: "Review comment is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!orderNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Order number is required",
        },
        {
          status: 400,
        },
      );
    }

    await dbConnect();

    const product = await Product.findOne({
      slug,
      isActive: true,
    })
      .select("_id")
      .lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        {
          status: 404,
        },
      );
    }

    const userId = user.id || user._id || user.userId;

    const order = await Order.findOne({
      orderNumber,

      user: userId,

      status: "delivered",

      "items.product": product._id,
    }).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can review a product only after purchasing and receiving it",
        },
        {
          status: 403,
        },
      );
    }

    const existing = await Review.findOne({
      product: product._id,

      user: userId,

      order: order._id,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already reviewed this product for this order",
        },
        {
          status: 409,
        },
      );
    }

    const review = await Review.create({
      product: product._id,

      user: userId,

      order: order._id,

      rating,

      title,

      comment,

      isApproved: true,
    });

    const stats = await Review.aggregate([
      {
        $match: {
          product: product._id,

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

    const averageRating = stats[0]?.averageRating || 0;

    const reviewCount = stats[0]?.reviewCount || 0;

    await Product.updateOne(
      {
        _id: product._id,
      },
      {
        $set: {
          rating: Math.round(averageRating * 10) / 10,

          reviewCount,
        },
      },
    );

    return NextResponse.json(
      {
        success: true,

        message: "Review submitted successfully",

        review,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST review error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit review",
      },
      {
        status: 500,
      },
    );
  }
}
