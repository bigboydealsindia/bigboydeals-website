"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/client";
import { getUserProfile } from "@/app/actions/auth";
import { LogoutDialog } from "@/components/shared/LogoutDialog";
import {
  Heart,
  ShoppingBag,
  Menu,
  ChevronDown,
  UserRound,
  Home,
  Search,
  UserStar,
  Package,
  LogOut,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MarqueeBanner } from "@/components/shared/MarqueeBanner";
import { useMarqueeStore } from "@/store/useMarqueeStore";
import { getStoreSettings } from "@/app/actions/settings";
import { useCategoryStore } from "@/store/useCategoryStore";
import { getAllCategories } from "@/app/actions/categories";
import { useWishlistStore } from "@/store/useWishlistStore";
import { getUserWishlistIds } from "@/app/actions/wishlist";
import { useCartStore } from "@/store/useCartStore";
import { getUserCartItems } from "@/app/actions/cart";
import { searchProducts } from "@/app/actions/search";

const searchPlaceholders = [
  "Search for Premium Sneakers...",
  "Search for Oversized T-Shirts...",
  "Search for Cargo Pants...",
  "Search for Accessories...",
];

export function Navbar() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // Smart Search States
  const [searchValue, setSearchValue] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dbUser, setDbUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [greeting, setGreeting] = useState("Hello");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const items = useMarqueeStore((state) => state.items);
  const isActive = useMarqueeStore((state) => state.isActive);
  const isMarqueeLoaded = useMarqueeStore((state) => state.isLoaded);
  const setMarquee = useMarqueeStore((state) => state.setMarquee);

  const categories = useCategoryStore((state) => state.categories);
  const isCatLoaded = useCategoryStore((state) => state.isLoaded);
  const setCategories = useCategoryStore((state) => state.setCategories);

  const wishlistIds = useWishlistStore((state) => state.wishlistIds) || [];
  const setWishlist = useWishlistStore((state) => state.setWishlist);

  const cartItems = useCartStore((state) => state.cartItems) || [];
  const setCartItems = useCartStore((state) => state.setCartItems);

  const wishlistCount = wishlistIds.length;
  const cartCount = cartItems.length;

  useEffect(() => {
    const timer = setTimeout(() => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isMarqueeLoaded) {
        const settings = await getStoreSettings();
        setMarquee(settings.marqueeTexts, settings.isMarqueeActive);
      }
    };
    fetchSettings();
  }, [isMarqueeLoaded, setMarquee]);

  useEffect(() => {
    const fetchCats = async () => {
      if (!isCatLoaded) {
        const data = await getAllCategories();
        setCategories(data);
      }
    };
    fetchCats();
  }, [isCatLoaded, setCategories]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      if (data?.user) {
        const profile = await getUserProfile();
        setDbUser(profile);

        const userWishlist = await getUserWishlistIds();
        setWishlist(userWishlist);

        const userCart = await getUserCartItems();
        setCartItems(userCart);
      } else {
        setWishlist([]);
        setCartItems([]);
      }
      setIsAuthLoading(false);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          const profile = await getUserProfile();
          setDbUser(profile);

          const userWishlist = await getUserWishlistIds();
          setWishlist(userWishlist);

          const userCart = await getUserCartItems();
          setCartItems(userCart);
        } else {
          setDbUser(null);
          setWishlist([]);
          setCartItems([]);
        }
        setIsAuthLoading(false);
      },
    );
    return () => authListener.subscription.unsubscribe();
  }, [supabase, setWishlist, setCartItems]);

  // SMART SEARCH DEBOUNCE LOGIC
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchValue.trim().length > 1) {
        setIsSearching(true);
        const results = await searchProducts(searchValue);
        setSearchResults(results);
        setIsSearching(false);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

  // Handle click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchValue.trim()) {
      setShowResults(false);
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const calculateDiscount = (selling: string, actual: string) => {
    const s = Number(selling);
    const a = Number(actual);
    if (a <= 0 || s >= a) return 0;
    return Math.round(((a - s) / a) * 100);
  };

  const primaryCategories = categories.filter((c) => c.parentId === null);

  if (pathname === "/login" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-[60] w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8">
          <div className="flex flex-col lg:flex-row lg:h-20 lg:items-center justify-between gap-4 py-4 lg:py-0">
            {/* LOGO CONTAINER: Responsive Layout for Mobile & PC */}
            <div className="flex items-center justify-between w-full lg:w-auto relative">
              {/* MOBILE LEFT: Symbol Logo */}
              <Link
                href="/"
                className="lg:hidden shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-secondary/20 overflow-hidden border border-border"
              >
                <Image
                  src="/symbol-logo.webp?v=2"
                  alt="Symbol Logo"
                  width={35}
                  height={35}
                  className="object-cover"
                  unoptimized
                />
              </Link>

              {/* MOBILE CENTER & DESKTOP LEFT: Typography Logo */}
              <Link
                href="/"
                className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 flex-shrink-0"
              >
                <Image
                  src="/typo-logo.webp?v=2"
                  alt="Big Boy Deals"
                  width={150}
                  height={50}
                  className="object-contain"
                  unoptimized
                />
              </Link>

              {/* MOBILE RIGHT: Wishlist Icon */}
              <div className="lg:hidden relative shrink-0">
                <Link href="/wishlist">
                  <Heart
                    size={24}
                    className={
                      wishlistCount > 0
                        ? "text-primary fill-primary/10"
                        : "text-muted-foreground"
                    }
                  />
                  {wishlistCount > 0 && (
                    <motion.span
                      key={wishlistCount}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                      }}
                      className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </Link>
              </div>
            </div>

            {/* SEARCH BAR CONTAINER */}
            <div
              className="w-full lg:max-w-xl xl:max-w-2xl flex-1 relative"
              ref={searchContainerRef}
            >
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center w-full"
              >
                <Input
                  type="text"
                  className="w-full h-11 pl-4 pr-12 rounded-md bg-secondary/50 border-border focus-visible:ring-primary z-10 bg-transparent"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => {
                    setIsFocused(true);
                    if (searchValue.trim().length > 1) setShowResults(true);
                  }}
                  onBlur={() => setIsFocused(false)}
                />

                {!searchValue && !isFocused && (
                  <div className="absolute left-4 pointer-events-none z-0 flex items-center text-muted-foreground">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={placeholderIndex}
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -5, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-sm"
                      >
                        {searchPlaceholders[placeholderIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}

                <button
                  type="submit"
                  className="absolute right-3 text-muted-foreground hover:text-primary transition-colors z-10"
                >
                  <Search size={20} />
                </button>
              </form>

              {/* SMART SEARCH DROPDOWN */}
              <AnimatePresence>
                {showResults && searchValue.trim().length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-2 w-full bg-background border border-border rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] z-[100] overflow-hidden"
                  >
                    {isSearching ? (
                      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <span className="text-sm font-medium">
                          Searching products...
                        </span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col">
                        <div className="max-h-[60vh] overflow-y-auto">
                          {searchResults.map((item) => {
                            const { product, brandName } = item;
                            const discount = calculateDiscount(
                              product.sellingPrice,
                              product.actualPrice,
                            );

                            return (
                              <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                onClick={() => setShowResults(false)}
                                className="flex items-center gap-3 p-3 hover:bg-secondary/40 border-b border-border/50 transition-colors group"
                              >
                                <div className="relative w-14 h-16 shrink-0 bg-secondary/20 rounded-md overflow-hidden border border-border/50">
                                  <Image
                                    src={product.mainImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                </div>
                                <div className="flex-1 flex flex-col justify-center min-w-0">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider line-clamp-1">
                                      {brandName || "Exclusive"}
                                    </span>
                                    {/* Consolidated Tags Layout */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {product.isMostSelling && (
                                        <span className="bg-yellow-400 text-yellow-950 text-[9px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm flex items-center gap-1 uppercase tracking-wider">
                                          <TrendingUp size={10} /> Hot
                                        </span>
                                      )}
                                      {discount > 0 && (
                                        <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm tracking-wider">
                                          {discount}% OFF
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <h4 className="text-sm font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors pr-2">
                                    {product.name}
                                  </h4>

                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-foreground">
                                      ₹
                                      {Number(
                                        product.sellingPrice,
                                      ).toLocaleString("en-IN")}
                                    </span>
                                    {Number(product.actualPrice) >
                                      Number(product.sellingPrice) && (
                                      <span className="text-xs font-medium text-muted-foreground line-through">
                                        ₹
                                        {Number(
                                          product.actualPrice,
                                        ).toLocaleString("en-IN")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                        <div className="p-2 bg-secondary/20 border-t border-border">
                          <Button
                            onClick={handleSearchSubmit}
                            variant="ghost"
                            className="w-full text-sm font-semibold hover:bg-secondary hover:text-primary h-9 rounded-md"
                          >
                            View all results for "{searchValue}"
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 text-center flex flex-col items-center justify-center">
                        <Search
                          size={32}
                          className="text-muted-foreground/30 mb-3"
                        />
                        <span className="text-sm font-semibold text-foreground">
                          No products found
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          Try checking your spelling or use less specific terms.
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              <Link href="/wishlist" className="relative group">
                <Heart
                  size={24}
                  className={`transition-colors ${wishlistCount > 0 ? "text-primary fill-primary/10" : "text-muted-foreground group-hover:text-primary"}`}
                />
                {wishlistCount > 0 && (
                  <motion.span
                    key={wishlistCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </Link>

              <Link href="/cart" className="relative group">
                <ShoppingBag
                  size={24}
                  className={`transition-colors ${cartCount > 0 ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
                />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>

              <Separator orientation="vertical" className="h-8" />

              {isAuthLoading ? (
                <div className="h-10 w-24 bg-secondary/50 animate-pulse rounded-md"></div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:bg-primary/10 rounded-full pr-4 py-0.5 pl-0.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
                      <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                        {dbUser?.fullName?.charAt(0).toUpperCase() ||
                          user.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium hidden xl:block text-foreground whitespace-nowrap">
                        {dbUser?.fullName?.split(" ")[0] || "Profile"}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-[var(--radius)] border-border mt-2"
                  >
                    <DropdownMenuLabel className="font-normal py-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-primary leading-none">
                          {greeting},{" "}
                          {dbUser?.fullName?.split(" ")[0] || "User"}!
                        </p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* NAYA: Ab Admin aur Staff dono ko panel ka option dikhega */}
                    {(dbUser?.role === "admin" || dbUser?.role === "staff") && (
                      <>
                        <DropdownMenuItem
                          onClick={() => router.push("/admin")}
                          className="cursor-pointer gap-3 py-2.5 rounded-md"
                        >
                          <UserStar size={16} className="text-primary" />{" "}
                          {dbUser?.role === "staff"
                            ? "Staff Panel"
                            : "Admin Panel"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem
                      onClick={() => router.push("/profile")}
                      className="cursor-pointer gap-3 py-2.5 rounded-md"
                    >
                      <UserRound size={16} className="text-muted-foreground" />{" "}
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/orders")}
                      className="cursor-pointer gap-3 py-2.5 rounded-md"
                    >
                      <Package size={16} className="text-muted-foreground" /> My
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setShowLogoutDialog(true);
                      }}
                      className="cursor-pointer gap-3 py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10 rounded-md"
                    >
                      <LogOut size={16} /> Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => router.push("/login")}
                  className="rounded-md font-medium px-6"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:block border-t border-border">
          <div className="max-w-[1400px] mx-auto w-full px-8 flex h-12 items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-6">
              <Link
                href="/categories"
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <Menu size={18} /> All Categories
              </Link>
              <Separator orientation="vertical" className="h-5" />
              <div className="flex items-center gap-6 z-50">
                {primaryCategories.map((cat) => {
                  const subCats = categories.filter(
                    (c) => c.parentId === cat.id,
                  );
                  const hasSub = subCats.length > 0;
                  return (
                    <div key={cat.id} className="relative group">
                      <Link
                        href={`/category/${cat.slug}`}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors py-3"
                      >
                        {cat.name}
                        {hasSub && (
                          <ChevronDown
                            size={14}
                            className="group-hover:rotate-180 transition-transform duration-200"
                          />
                        )}
                      </Link>
                      {hasSub && (
                        <div className="absolute top-full left-0 w-48 bg-background border border-border rounded-[var(--radius)] shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 overflow-hidden">
                          {subCats.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/category/${cat.slug}/${sub.slug}`}
                              className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/contact-us"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact Us
              </Link>
              <button
                onClick={() => toast.info("Store location feature coming soon")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Store Location
              </button>
            </div>
          </div>
        </div>
      </header>

      {isActive && items.length > 0 && <MarqueeBanner items={items} />}

      <div className="lg:hidden fixed bottom-4 left-0 right-0 px-4 z-50 pointer-events-none">
        <div className="max-w-fit gap-5 mx-auto bg-background/95 backdrop-blur-md border border-border shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full px-4 py-2.5 flex justify-between items-center pointer-events-auto">
          <Link href="/" className="flex flex-col items-center">
            <div
              className={`p-2.5 rounded-full transition-colors ${pathname === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Home size={22} />
            </div>
          </Link>
          <Link href="/categories" className="flex flex-col items-center">
            <div
              className={`p-2.5 rounded-full transition-colors ${pathname.includes("/categories") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Menu size={22} />
            </div>
          </Link>
          <button
            onClick={() =>
              user ? router.push("/account") : router.push("/login")
            }
            className="flex flex-col items-center relative"
          >
            <div
              className={`p-2.5 rounded-full transition-colors ${pathname.includes("/account") || pathname.includes("/profile") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <UserRound size={22} />
            </div>
            {user && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></span>
            )}
          </button>
          <button
            onClick={() =>
              user ? router.push("/cart") : router.push("/login?next=/cart")
            }
            className="flex flex-col items-center relative"
          >
            <div
              className={`p-2.5 rounded-full transition-colors ${pathname.includes("/cart") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ShoppingBag size={22} />
            </div>
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground border border-background">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
      />
    </>
  );
}
