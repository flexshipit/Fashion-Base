import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/database/dbConnect";
import { requireAdmin } from "@/lib/auth/auth";
import Order from "@/lib/models/Order";
import { adjustOrderStock } from "@/lib/order/stock";

const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();

    const { orderNumber } = await params;
    const body = await request.json();
    const { status } = body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order status",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 },
      );
    }

    if (order.status === status) {
      return NextResponse.json({
        success: true,
        message: "Order already has this status",
        order,
      });
    }

    const previousStatus = order.status;
    const becomingCancelled =
      status === "cancelled" && previousStatus !== "cancelled";
    const leavingCancelled =
      previousStatus === "cancelled" && status !== "cancelled";

    const mongoSession = await mongoose.startSession();

    try {
      await mongoSession.withTransaction(async () => {
        if (becomingCancelled) {
          await adjustOrderStock(order, 1, mongoSession);
          order.cancellation = {
            reason: body.reason || "Cancelled by admin",
            cancelledAt: new Date(),
            cancelledBy: null,
          };
        }

        if (leavingCancelled) {
          await adjustOrderStock(order, -1, mongoSession);
          order.cancellation = undefined;
        }

        order.status = status;

        if (status === "shipped") {
          order.shipment.status = "shipped";
          order.shipment.shippedAt = order.shipment.shippedAt || new Date();
        }

        if (status === "delivered") {
          order.shipment.status = "delivered";
          order.shipment.deliveredAt =
            order.shipment.deliveredAt || new Date();

          if (order.payment.method === "cod") {
            order.payment.status = "paid";
          }
        }

        if (status === "returned") {
          order.shipment.status = "returned";
        }

        if (status === "cancelled") {
          if (order.shipment?.status && order.shipment.status !== "pending") {
            order.shipment.status = "cancelled";
          }
        }

        await order.save({ session: mongoSession });
      });
    } finally {
      await mongoSession.endSession();
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("PATCH order status error:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update order status",
      },
      { status: 500 },
    );
  }
}
