"use server";

import { db } from "@/db";
import { orders, users, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getDashboardStats() {
  try {
    // 1. Fetch All Orders
    const allOrders = await db.select().from(orders);

    let totalRevenue = 0;
    const totalOrders = allOrders.length;

    // Prepare Chart Data (Last 6 Months)
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const chartDataMap: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      chartDataMap[`${monthNames[d.getMonth()]} ${d.getFullYear()}`] = 0;
    }

    allOrders.forEach((order) => {
      if (order.status !== "cancelled") {
        const amount = Number(order.totalAmount || 0);
        totalRevenue += amount;

        const d = new Date(order.createdAt);
        const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (chartDataMap[monthKey] !== undefined) {
          chartDataMap[monthKey] += amount;
        }
      }
    });

    const revenueChartData = Object.keys(chartDataMap).map((key) => ({
      name: key,
      total: chartDataMap[key],
    }));

    // 2. Fetch Total Customers
    const customersArray = await db
      .select()
      .from(users)
      .where(eq(users.role, "user"));
    const totalCustomers = customersArray.length;

    // 3. Fetch Products & Prepare Pie Chart Data
    const productsArray = await db.select().from(products);
    const totalProducts = productsArray.length;

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    productsArray.forEach((p) => {
      if (p.stock === 0) outOfStock++;
      else if (p.stock <= 10) lowStock++;
      else inStock++;
    });

    const productPieData = [
      { name: "In Stock", value: inStock, color: "#16a34a" }, // Green
      { name: "Low Stock", value: lowStock, color: "#d97706" }, // Amber
      { name: "Out of Stock", value: outOfStock, color: "#dc2626" }, // Red
    ];

    // 4. Fetch Recent Orders (Latest 10)
    const recentOrders = await db
      .select({
        id: orders.id,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
        paymentMethod: orders.paymentMethod,
        userFullName: users.fullName,
        userEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(10); // Changed to 10

    return {
      success: true,
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      revenueChartData,
      productPieData,
      recentOrders,
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return { success: false };
  }
}
