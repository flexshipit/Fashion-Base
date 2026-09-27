import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";

const ANALYTICS_TZ = "Asia/Dhaka";

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function daysAgo(n) {
  const date = startOfDay(new Date());
  date.setDate(date.getDate() - n);
  return date;
}

function localDateKey(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ANALYTICS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Active sales: exclude cancelled/returned */
const activeSalesMatch = {
  status: { $nin: ["cancelled", "returned"] },
};

export async function getDashboardAnalytics() {
  const now = new Date();
  const today = startOfDay(now);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const last7Start = daysAgo(6);

  const [
    salesResult,
    collectedResult,
    orderCount,
    customerCount,
    productCount,
    pendingOrders,
    pendingPayments,
    deliveredOrders,
    cancelledOrders,
    todaySalesResult,
    monthSalesResult,
    todayCollectedResult,
    monthCollectedResult,
    recentOrders,
    topProducts,
    lowStockProducts,
    orderStatusBreakdown,
    paymentMethodBreakdown,
    paymentStatusBreakdown,
    last7DaysSales,
  ] = await Promise.all([
    // Gross sales (all non-cancelled orders)
    Order.aggregate([
      { $match: activeSalesMatch },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$pricing.grandTotal" },
          count: { $sum: 1 },
        },
      },
    ]),

    // Collected money (paid/verified)
    Order.aggregate([
      {
        $match: {
          ...activeSalesMatch,
          "payment.status": { $in: ["verified", "paid"] },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$pricing.grandTotal" },
        },
      },
    ]),

    Order.countDocuments(),

    // Unique customers from orders (guest + registered) by phone
    Order.aggregate([
      {
        $group: {
          _id: {
            $trim: {
              input: { $ifNull: ["$customer.phone", ""] },
            },
          },
        },
      },
      {
        $match: {
          _id: { $ne: "" },
        },
      },
      {
        $count: "count",
      },
    ]),

    Product.countDocuments({ isActive: true }),

    Order.countDocuments({
      status: { $in: ["pending", "confirmed", "processing"] },
    }),

    Order.countDocuments({
      "payment.status": "pending",
      "payment.method": { $in: ["bkash", "nagad"] },
    }),

    Order.countDocuments({ status: "delivered" }),

    Order.countDocuments({ status: "cancelled" }),

    Order.aggregate([
      {
        $match: {
          ...activeSalesMatch,
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$pricing.grandTotal" },
          count: { $sum: 1 },
        },
      },
    ]),

    Order.aggregate([
      {
        $match: {
          ...activeSalesMatch,
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$pricing.grandTotal" },
          count: { $sum: 1 },
        },
      },
    ]),

    Order.aggregate([
      {
        $match: {
          ...activeSalesMatch,
          createdAt: { $gte: today },
          "payment.status": { $in: ["verified", "paid"] },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$pricing.grandTotal" },
        },
      },
    ]),

    Order.aggregate([
      {
        $match: {
          ...activeSalesMatch,
          createdAt: { $gte: startOfMonth },
          "payment.status": { $in: ["verified", "paid"] },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$pricing.grandTotal" },
        },
      },
    ]),

    Order.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select("orderNumber customer pricing status payment createdAt")
      .lean(),

    Order.aggregate([
      { $match: activeSalesMatch },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            product: "$items.product",
            name: "$items.productName",
          },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.totalPrice" },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 8 },
    ]),

    Product.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          effectiveStock: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ["$variants", []] } }, 0] },
              { $min: "$variants.stock" },
              "$stock",
            ],
          },
        },
      },
      { $match: { effectiveStock: { $lte: 5 } } },
      { $sort: { effectiveStock: 1 } },
      { $limit: 8 },
      {
        $project: {
          name: 1,
          slug: 1,
          stock: "$effectiveStock",
          salePrice: 1,
          originalPrice: 1,
        },
      },
    ]),

    Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    Order.aggregate([
      {
        $group: {
          _id: "$payment.method",
          count: { $sum: 1 },
          amount: { $sum: "$pricing.grandTotal" },
        },
      },
    ]),

    Order.aggregate([
      {
        $group: {
          _id: "$payment.status",
          count: { $sum: 1 },
          amount: { $sum: "$pricing.grandTotal" },
        },
      },
    ]),

    Order.aggregate([
      {
        $match: {
          ...activeSalesMatch,
          createdAt: { $gte: last7Start },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: ANALYTICS_TZ,
            },
          },
          sales: { $sum: "$pricing.grandTotal" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const sales = salesResult[0]?.revenue || 0;
  const salesCount = salesResult[0]?.count || 0;
  const averageOrderValue = salesCount > 0 ? Math.round(sales / salesCount) : 0;

  // Fill missing days in last 7 days chart
  const salesByDay = new Map(
    (last7DaysSales || []).map((item) => [item._id, item]),
  );
  const last7Days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const day = daysAgo(i);
    const key = localDateKey(day);
    const found = salesByDay.get(key);
    last7Days.push({
      date: key,
      label: day.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      sales: found?.sales || 0,
      orders: found?.orders || 0,
    });
  }

  return {
    // Backward-compatible main revenue = gross sales (not only paid)
    revenue: sales,
    collectedRevenue: collectedResult[0]?.revenue || 0,
    averageOrderValue,

    orders: orderCount,
    customers: customerCount[0]?.count || 0,
    products: productCount,

    pendingOrders,
    pendingPayments,
    deliveredOrders,
    cancelledOrders,

    todayRevenue: todaySalesResult[0]?.revenue || 0,
    todayOrders: todaySalesResult[0]?.count || 0,
    todayCollected: todayCollectedResult[0]?.revenue || 0,

    monthRevenue: monthSalesResult[0]?.revenue || 0,
    monthOrders: monthSalesResult[0]?.count || 0,
    monthCollected: monthCollectedResult[0]?.revenue || 0,

    recentOrders,
    topProducts,
    lowStockProducts,
    orderStatusBreakdown,
    paymentMethodBreakdown,
    paymentStatusBreakdown,
    last7Days,
  };
}
