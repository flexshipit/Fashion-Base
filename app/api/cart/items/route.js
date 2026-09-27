import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Cart from "@/lib/models/Cart";
import { getAuthUser } from "@/lib/auth/auth";
import { getSessionIdentity } from "@/lib/auth/session";
import { getCartQuery } from "@/lib/cart/cart";

export async function DELETE() {
  try {
    const user = await getAuthUser();

    const session = await getSessionIdentity(user);

    await dbConnect();

    const cart = await Cart.findOne(getCartQuery(session));

    if (!cart) {
      return NextResponse.json({
        success: true,
        message: "Cart is already empty",
        cart: {
          items: [],
        },
      });
    }

    cart.items = [];

    await cart.save();

    return NextResponse.json({
      success: true,

      message: "Cart cleared",

      cart,
    });
  } catch (error) {
    console.error("DELETE /api/cart/items error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to clear cart",
      },
      {
        status: 500,
      },
    );
  }
}
