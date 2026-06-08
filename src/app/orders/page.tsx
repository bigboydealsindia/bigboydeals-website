import { getUserOrders } from "@/app/actions/user-orders";
import { OrdersClient } from "@/components/orders/OrdersClient";

export const revalidate = 0; // Disable static generation for authenticated pages

export const metadata = {
  title: "My Orders | Big Boy Deals",
};

export default async function OrdersPage() {
  const { success, orders } = await getUserOrders();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl min-h-[80vh]">
      <OrdersClient initialOrders={success ? orders : []} />
    </div>
  );
}
