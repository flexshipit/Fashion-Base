import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import { requireAdmin } from "@/lib/auth/auth";
import Order from "@/lib/models/Order";
import { authErrorResponse } from "@/lib/utils/apiResponse";

export async function GET(request, { params }) {
  try {
    await requireAdmin();

    const { orderNumber } = await params;

    await dbConnect();

    const order = await Order.findOne({
      orderNumber,
    })
      .populate("user", "name email phone")
      .populate("payment.verifiedBy", "name email")
      .lean();

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

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET /api/admin/orders/[orderNumber] error:", error);

    const authError = authErrorResponse(error);
    if (authError) return authError;

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
