import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import { getAuthUser } from "@/lib/auth/auth";
import { getSessionIdentity } from "@/lib/auth/session";
import Order from "@/lib/models/Order";

export async function GET() {
  try {
    const user = await getAuthUser();

    const session = await getSessionIdentity(user);

    await dbConnect();

    const query =
      session.type === "user"
        ? {
            user: session.id,
          }
        : {
            guestId: session.id,
          };

    const orders = await Order.find(query)
      .sort({
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET /api/orders/my error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      {
        status: 500,
      },
    );
  }
}
