import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import { getAuthUser } from "@/lib/auth/auth";
import { getSessionIdentity, setGuestCookie } from "@/lib/auth/session";
import { createOrder } from "@/lib/order/createOrder";

export async function POST(request) {
  try {
    const user = await getAuthUser();
    const session = await getSessionIdentity(user);
    const body = await request.json();

    const { name, phone, district, address, paymentMethod, transactionId } =
      body;

    await dbConnect();

    const result = await createOrder({
      userId: session.type === "user" ? session.id : null,
      guestId: session.type === "guest" ? session.id : null,
      customer: {
        name,
        phone,
        district,
        address,
      },
      paymentMethod,
      transactionId,
    });

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          message: result.error,
        },
        {
          status: result.status,
        },
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        order: result.order,
      },
      {
        status: 201,
      },
    );

    // Keep the same guest identity so this browser can still see the order
    if (session.shouldSetCookie && session.type === "guest") {
      setGuestCookie(response, session.id);
    }

    return response;
  } catch (error) {
    console.error("POST /api/orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to place order",
      },
      {
        status: 500,
      },
    );
  }
}
