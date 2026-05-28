import { CartClient } from "@/components/cart/CartClient";
import { getUserProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Shopping Cart | Big Boy Deals",
  description: "Review your shopping cart and proceed to checkout.",
};

export default async function CartPage() {
  const user = await getUserProfile();

  if (!user) {
    redirect("/login?next=/cart");
  }

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6 min-h-[60vh]">
      <CartClient user={user} />
    </div>
  );
}
