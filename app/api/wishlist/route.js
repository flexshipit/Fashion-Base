import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Wishlist from "@/lib/models/Wishlist";
import Product from "@/lib/models/Product";
import { getAuthUser } from "@/lib/auth/auth";
import { getSessionIdentity, setGuestCookie } from "@/lib/auth/session";

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

function getWishlistOwner(session) {
  if (session.type === "user") {
    return {
      user: session.id,
    };
  }

  return {
    guestId: session.id,
  };
}

export async function GET() {
  try {
    const user = await getAuthUser();

    const session = await getSessionIdentity(user);

    await dbConnect();

    const wishlist = await Wishlist.findOne(getWishlistQuery(session))
      .populate({
        path: "products",
        match: {
          isActive: true,
        },
        populate: {
          path: "category",
          select: "name slug",
        },
      })
      .lean();

    if (!wishlist) {
      const response = NextResponse.json({
        success: true,

        wishlist: {
          products: [],
          count: 0,
        },
      });

      if (session.shouldSetCookie) {
        setGuestCookie(response, session.id);
      }

      return response;
    }

    const products = (wishlist.products || []).filter(Boolean);

    const response = NextResponse.json({
      success: true,

      wishlist: {
        _id: wishlist._id,

        products,

        count: products.length,
      },
    });

    if (session.shouldSetCookie) {
      setGuestCookie(response, session.id);
    }

    return response;
  } catch (error) {
    console.error("GET /api/wishlist error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch wishlist",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();

    const session = await getSessionIdentity(user);

    const body = await request.json();

    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        {
          status: 400,
        },
      );
    }

    await dbConnect();

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    })
      .select("_id")
      .lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found or inactive",
        },
        {
          status: 404,
        },
      );
    }

    const wishlist = await Wishlist.findOne(getWishlistQuery(session));

    let currentWishlist = wishlist;

    if (!currentWishlist) {
      currentWishlist = await Wishlist.create({
        ...getWishlistOwner(session),

        products: [productId],
      });
    } else {
      const alreadyExists = currentWishlist.products.some(
        (id) => id.toString() === productId.toString(),
      );

      if (!alreadyExists) {
        currentWishlist.products.push(productId);

        await currentWishlist.save();
      }
    }

    const response = NextResponse.json({
      success: true,

      message: "Product added to wishlist",

      wishlist: currentWishlist,
    });

    if (session.shouldSetCookie) {
      setGuestCookie(response, session.id);
    }

    return response;
  } catch (error) {
    console.error("POST /api/wishlist error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add product to wishlist",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE() {
  try {
    const user = await getAuthUser();

    const session = await getSessionIdentity(user);

    await dbConnect();

    const wishlist = await Wishlist.findOne(getWishlistQuery(session));

    if (!wishlist) {
      return NextResponse.json({
        success: true,

        message: "Wishlist is already empty",
      });
    }

    wishlist.products = [];

    await wishlist.save();

    return NextResponse.json({
      success: true,

      message: "Wishlist cleared",

      wishlist,
    });
  } catch (error) {
    console.error("DELETE /api/wishlist error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to clear wishlist",
      },
      {
        status: 500,
      },
    );
  }
}
