import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/database/dbConnect";
import { requireAdmin } from "@/lib/auth/auth";
import Order from "@/lib/models/Order";
import { adjustOrderStock } from "@/lib/order/stock";

/**
 * Admin cancel with stock restore.
 * Prefer this (or status→cancelled) when an admin cancels an order.
 */
export async function PATCH(request, { params }) {
  try {
    await requireAdmin();

    const { orderNumber } = await params;
    const body = await request.json().catch(() => ({}));
    const reason =
      typeof body.reason === "string" ? body.reason.trim() : "Cancelled by admin";

    await dbConnect();

    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    if (order.status === "cancelled") {
      return NextResponse.json({
        success: true,
        message: "Order is already cancelled",
        order,
      });
    }

    if (["delivered", "returned"].includes(order.status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivered or returned orders cannot be cancelled this way",
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
          cancelledBy: null,
        };

        if (order.shipment?.status && order.shipment.status !== "pending") {
          order.shipment.status = "cancelled";
        }

        await order.save({ session: mongoSession });
      });
    } finally {
      await mongoSession.endSession();
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled and stock restored",
      order,
    });
  } catch (error) {
    console.error("PATCH admin order cancel error:", error);

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
      { success: false, message: "Failed to cancel order" },
      { status: 500 },
    );
  }
}
