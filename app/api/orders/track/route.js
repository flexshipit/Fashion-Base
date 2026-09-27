import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Order from "@/lib/models/Order";

function normalizePhone(phone) {
  if (typeof phone !== "string") return "";
  return phone.replace(/\s+/g, "").trim();
}

/**
 * Track any order with order number + phone.
 * Works across browsers without login.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const orderNumber = String(body.orderNumber || "").trim().toUpperCase();
    const phone = normalizePhone(body.phone);

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: "Order number is required" },
        { status: 400 },
      );
    }

    if (!/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid Bangladesh phone number is required",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const order = await Order.findOne({ orderNumber }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    const orderPhone = normalizePhone(order.customer?.phone);

    if (orderPhone !== phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Order number and phone number do not match",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("POST /api/orders/track error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to track order" },
      { status: 500 },
    );
  }
}
