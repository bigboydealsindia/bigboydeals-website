"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  Clock4,
  RefreshCw,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard,
  Banknote,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function DashboardClient({ stats }: { stats: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-amber-600 bg-amber-500/10 border-amber-500/20";
      case "processing":
        return "text-blue-600 bg-blue-500/10 border-blue-500/20";
      case "shipped":
        return "text-purple-600 bg-purple-500/10 border-purple-500/20";
      case "delivered":
        return "text-green-600 bg-green-500/10 border-green-500/20";
      case "cancelled":
        return "text-red-600 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-600 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock4 size={14} />;
      case "processing":
        return <RefreshCw size={14} />;
      case "shipped":
        return <Truck size={14} />;
      case "delivered":
        return <CheckCircle2 size={14} />;
      case "cancelled":
        return <XCircle size={14} />;
      default:
        return <Package size={14} />;
    }
  };

  const safeStats = useMemo(() => {
    if (!stats || !stats.success) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        revenueChartData: [],
        productPieData: [],
        recentOrders: [],
      };
    }
    return stats;
  }, [stats]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Real-time metrics, analytics, and recent activity for your store.
        </p>
      </div>

      {/* TOP: 4 Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border-border shadow-sm hover:shadow-md transition-shadow bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </CardTitle>
            <div className="p-2.5 bg-green-500/10 rounded-lg text-green-600">
              <IndianRupee size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              ₹{safeStats.totalRevenue.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm hover:shadow-md transition-shadow bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Total Orders
            </CardTitle>
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-600">
              <ShoppingBag size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {safeStats.totalOrders.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm hover:shadow-md transition-shadow bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Total Customers
            </CardTitle>
            <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-600">
              <Users size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {safeStats.totalCustomers.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm hover:shadow-md transition-shadow bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Active Products
            </CardTitle>
            <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-600">
              <Package size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {safeStats.totalProducts.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MIDDLE: Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Revenue Bar Chart (Takes 2 columns) */}
        <Card className="lg:col-span-2 rounded-xl border-border shadow-sm bg-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              Revenue Analytics (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[350px] pl-0">
            {safeStats.revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={safeStats.revenueChartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                    dx={-10}
                  />
                  {/* FIX: Improved Tooltip UI with solid background, shadows, and TypeScript safety */}
                  <Tooltip
                    cursor={{ fill: "hsl(var(--secondary))", opacity: 0.3 }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      color: "hsl(var(--foreground))",
                    }}
                    itemStyle={{
                      color: "hsl(var(--primary))",
                      fontWeight: 700,
                    }}
                    labelStyle={{
                      color: "hsl(var(--muted-foreground))",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [
                      `₹${Number(value).toLocaleString("en-IN")}`,
                      "Revenue",
                    ]}
                  />
                  <Bar
                    dataKey="total"
                    fill="#e11d48"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Products Pie Chart (Takes 1 column) */}
        <Card className="lg:col-span-1 rounded-xl border-border shadow-sm bg-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              Product Stock Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[350px] flex items-center justify-center">
            {safeStats.productPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {/* FIX: Solid Premium Tooltip for Pie Chart too */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      color: "hsl(var(--foreground))",
                    }}
                    itemStyle={{ fontWeight: 700 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [value, "Products"]}
                  />
                  <Pie
                    data={safeStats.productPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {safeStats.productPieData.map(
                      (entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ),
                    )}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM: Full Width Recent Orders Table */}
      <Card className="rounded-xl border-border shadow-sm bg-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-secondary/5 border-b border-border p-5">
          <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
          <Link
            href="/admin/orders"
            className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
          >
            View All <ArrowUpRight size={16} />
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/20">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Order ID</th>
                <th className="px-6 py-4 font-bold tracking-wider">Customer</th>
                <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                <th className="px-6 py-4 font-bold tracking-wider">Payment</th>
                <th className="px-6 py-4 font-bold tracking-wider">Amount</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {safeStats.recentOrders.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                safeStats.recentOrders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="hover:bg-secondary/10 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-foreground">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground line-clamp-1">
                          {order.userFullName || "Guest User"}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {order.userEmail || "No Email"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {order.paymentMethod === "razorpay" ||
                        order.paymentMethod === "online" ? (
                          <>
                            <CreditCard size={14} className="text-green-600" />{" "}
                            <span className="text-xs font-bold uppercase">
                              Online
                            </span>
                          </>
                        ) : (
                          <>
                            <Banknote size={14} className="text-amber-600" />{" "}
                            <span className="text-xs font-bold uppercase">
                              COD
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-foreground whitespace-nowrap">
                      ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground font-medium border-dashed border-t"
                  >
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
