import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Product from "@/lib/models/Product";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { slug } = await params;

    const product = await Product.findOne({
      slug,
      isActive: true,
    })
      .populate("category", "name slug description image")
      .lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    /*
     * Only expose active variants to customers.
     */

    if (Array.isArray(product.variants)) {
      product.variants = product.variants.filter((variant) => variant.isActive);
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
      },
      { status: 500 },
    );
  }
}
