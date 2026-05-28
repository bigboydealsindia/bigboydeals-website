import { getAdminOrders } from "@/app/actions/admin-orders";
import { OrdersClient } from "@/components/admin/OrdersClient";

export const metadata = {
  title: "Manage Orders | Admin Panel",
};

export default async function AdminOrdersPage() {
  const data = await getAdminOrders();

  return (
    <div className="w-full">
      <OrdersClient initialOrders={data.orders} storeInfo={data.storeInfo} />
    </div>
  );
}
