import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Wishlist from "@/lib/models/Wishlist";
import { getAuthUser } from "@/lib/auth/auth";
import { getSessionIdentity } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/cart/cart";

function getWishlistQuery(session) {
  if (session.type === "user") {
    return {
      user: session.id,
    };
  }

  return {
    guestId: session.id,
  };
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser();

    const session = await getSessionIdentity(user);

    const { productId } = await params;

    if (!isValidObjectId(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        {
          status: 400,
        },
      );
    }

    await dbConnect();

    const wishlist = await Wishlist.findOne(getWishlistQuery(session));

    if (!wishlist) {
      return NextResponse.json(
        {
          success: false,
          message: "Wishlist not found",
        },
        {
          status: 404,
        },
      );
    }

    const originalLength = wishlist.products.length;

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId.toString(),
    );

    if (wishlist.products.length === originalLength) {
      return NextResponse.json(
        {
          success: false,
          message: "Product is not in wishlist",
        },
        {
          status: 404,
        },
      );
    }

    await wishlist.save();

    return NextResponse.json({
      success: true,

      message: "Product removed from wishlist",

      wishlist,
    });
  } catch (error) {
    console.error("DELETE /api/wishlist/[productId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove product from wishlist",
      },
      {
        status: 500,
      },
    );
  }
}
