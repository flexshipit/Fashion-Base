import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import { requireAdmin } from "@/lib/auth/auth";
import Order from "@/lib/models/Order";
import { authErrorResponse } from "@/lib/utils/apiResponse";

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();

    const { orderNumber } = await params;

    const body = await request.json();

    const { courier = "", trackingNumber = "", note = "" } = body;

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

    order.shipment.courier = courier.trim();

    order.shipment.trackingNumber = trackingNumber.trim();

    order.shipment.note = note.trim();

    await order.save();

    return NextResponse.json({
      success: true,

      message: "Shipment information updated",

      shipment: order.shipment,
    });
  } catch (error) {
    console.error("PATCH shipment error:", error);

    const authError = authErrorResponse(error);
    if (authError) return authError;

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update shipment",
      },
      {
        status: 500,
      },
    );
  }
}
