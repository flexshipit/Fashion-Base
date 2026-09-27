import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Cart from "@/lib/models/Cart";
import { getAuthUser } from "@/lib/auth/auth";
import { getSessionIdentity } from "@/lib/auth/session";
import {
  getCartQuery,
  getProductForCart,
  isValidObjectId,
} from "@/lib/cart/cart";

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser();

    const session = await getSessionIdentity(user);

    const { itemId } = await params;

    if (!isValidObjectId(itemId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid cart item ID",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const quantity = Number(body.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be a positive integer",
        },
        {
          status: 400,
        },
      );
    }

    await dbConnect();

    const cart = await Cart.findOne(getCartQuery(session));

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart not found",
        },
        {
          status: 404,
        },
      );
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item not found",
        },
        {
          status: 404,
        },
      );
    }

    const productData = await getProductForCart(item.product, item.variant);

    if (productData.error) {
      return NextResponse.json(
        {
          success: false,
          message: productData.error,
        },
        {
          status: productData.status,
        },
      );
    }

    if (quantity > productData.stock) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${productData.stock} item(s) available`,
        },
        {
          status: 409,
        },
      );
    }

    item.quantity = quantity;

    item.salePrice = productData.salePrice;

    item.sku = productData.sku;

    item.selectedAttributes = productData.selectedAttributes;

    item.image = productData.image;

    await cart.save();

    return NextResponse.json({
      success: true,

      message: "Cart item updated",

      cart,
    });
  } catch (error) {
    console.error("PATCH /api/cart/items/[itemId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update cart item",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser();

    const session = await getSessionIdentity(user);

    const { itemId } = await params;

    if (!isValidObjectId(itemId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid cart item ID",
        },
        {
          status: 400,
        },
      );
    }

    await dbConnect();

    const cart = await Cart.findOne(getCartQuery(session));

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart not found",
        },
        {
          status: 404,
        },
      );
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item not found",
        },
        {
          status: 404,
        },
      );
    }

    item.deleteOne();

    await cart.save();

    return NextResponse.json({
      success: true,

      message: "Cart item removed",

      cart,
    });
  } catch (error) {
    console.error("DELETE /api/cart/items/[itemId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove cart item",
      },
      {
        status: 500,
      },
    );
  }
}
