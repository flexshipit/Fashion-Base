import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import { requireAdmin } from "@/lib/auth/auth";
import Order from "@/lib/models/Order";
import { authErrorResponse } from "@/lib/utils/apiResponse";

export async function PATCH(request, { params }) {
  try {
    const admin = await requireAdmin();

    const { orderNumber } = await params;

    const body = await request.json();

    const { status, rejectionReason = "" } = body;

    const allowedStatuses = ["verified", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment status must be verified or rejected",
        },
        {
          status: 400,
        },
      );
    }

    await dbConnect();

    const order = await Order.findOne({
      orderNumber,
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        {
          status: 404,
        },
      );
    }

    if (order.payment.method === "cod") {
      return NextResponse.json(
        {
          success: false,
          message: "COD payments do not require transaction verification",
        },
        {
          status: 400,
        },
      );
    }

    if (!order.payment.transactionId) {
      return NextResponse.json(
        {
          success: false,
          message: "This order has no transaction ID",
        },
        {
          status: 400,
        },
      );
    }

    order.payment.status = status;
    order.payment.verifiedAt = new Date();
    order.payment.verifiedBy = admin.id || admin._id || admin.userId;

    order.payment.rejectionReason =
      status === "rejected" ? rejectionReason.trim() : "";

    /*
     * A successfully verified online payment
     * can move a pending order into confirmed.
     */
    if (status === "verified" && order.status === "pending") {
      order.status = "confirmed";
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: status === "verified" ? "Payment verified" : "Payment rejected",
      order,
    });
  } catch (error) {
    console.error("PATCH payment error:", error);

    const authError = authErrorResponse(error);
    if (authError) return authError;

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update payment",
      },
      {
        status: 500,
      },
    );
  }
}
