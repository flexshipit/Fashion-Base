import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import { getAuthUser } from "@/lib/auth/auth";
import { getSessionIdentity } from "@/lib/auth/session";
import Order from "@/lib/models/Order";

function normalizePhone(phone) {
  if (typeof phone !== "string") return "";
  return phone.replace(/\s+/g, "").trim();
}

export async function GET(request, { params }) {
  try {
    const user = await getAuthUser();
    const session = await getSessionIdentity(user);
    const { orderNumber } = await params;
    const { searchParams } = new URL(request.url);
    const phone = normalizePhone(searchParams.get("phone") || "");

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

    // 1) Owner by login / guest session
    const ownershipQuery =
      session.type === "user"
        ? {
            orderNumber,
            user: session.id,
          }
        : {
            orderNumber,
            guestId: session.id,
          };

    let order = await Order.findOne(ownershipQuery).lean();

    // 2) Or verify with phone (works from another browser)
    if (!order && phone) {
      const byNumber = await Order.findOne({ orderNumber }).lean();
      if (
        byNumber &&
        normalizePhone(byNumber.customer?.phone) === phone
      ) {
        order = byNumber;
      }
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order not found. Use Track Order with your phone number if this is a guest order.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET /api/orders/[orderNumber] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
      },
      {
        status: 500,
      },
    );
  }
}
