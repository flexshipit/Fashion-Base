import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/database/dbConnect";
import { getAuthUser } from "@/lib/auth/auth";
import { getSessionIdentity } from "@/lib/auth/session";
import Order from "@/lib/models/Order";
import { adjustOrderStock } from "@/lib/order/stock";

/**
 * Customer / guest cancel for their own pending or confirmed order.
 */
export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser();
    const identity = await getSessionIdentity(user);
    const { orderNumber } = await params;

    const body = await request.json().catch(() => ({}));
    const reason =
      typeof body.reason === "string" ? body.reason.trim() : "Cancelled by customer";

    await dbConnect();

    const orderQuery =
      identity.type === "user"
        ? { orderNumber, user: identity.id }
        : { orderNumber, guestId: identity.id };

    const order = await Order.findOne(orderQuery);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return NextResponse.json(
        {
          success: false,
          message: "This order can no longer be cancelled",
        },
        { status: 409 },
      );
    }

    const mongoSession = await mongoose.startSession();

    try {
      await mongoSession.withTransaction(async () => {
        await adjustOrderStock(order, 1, mongoSession);

        order.status = "cancelled";
        order.cancellation = {
          reason,
          cancelledAt: new Date(),
          cancelledBy: identity.type === "user" ? identity.id : null,
        };

        await order.save({ session: mongoSession });
      });
    } finally {
      await mongoSession.endSession();
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("PATCH /api/orders/[orderNumber]/cancel error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to cancel order" },
      { status: 500 },
    );
  }
}
