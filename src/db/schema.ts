import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  decimal,
  numeric,
  jsonb,
  pgEnum,
  AnyPgColumn,
} from "drizzle-orm/pg-core";

// ==========================================
// ENUMS
// ==========================================
export const roleEnum = pgEnum("role", ["admin", "user", "staff"]);
export const couponTypeEnum = pgEnum("coupon_type", [
  "per_product",
  "overall_percent",
  "flat",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);
export const paymentMethodEnum = pgEnum("payment_method", ["razorpay", "cod"]);

// ==========================================
// CORE (USERS)
// ==========================================
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  fullName: text("full_name"),

  // Delivery Address Fields
  streetAddress: text("street_address"),
  city: text("city"),
  state: text("state"),
  pincode: varchar("pincode", { length: 10 }),
  country: text("country").default("India"),

  role: roleEnum("role").default("user").notNull(),
  accessPages: jsonb("access_pages").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// CATALOG (CATEGORIES & BRANDS)
// ==========================================
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  imageUrl: text("image_url"),
  parentId: integer("parent_id").references((): AnyPgColumn => categories.id, {
    onDelete: "cascade",
  }),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// PRODUCTS
// ==========================================
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  brandId: integer("brand_id").references((): AnyPgColumn => brands.id, {
    onDelete: "set null",
  }),
  mainCategoryId: integer("main_category_id").references(
    (): AnyPgColumn => categories.id,
    { onDelete: "set null" },
  ),
  subCategoryId: integer("sub_category_id").references(
    (): AnyPgColumn => categories.id,
    { onDelete: "set null" },
  ),
  sellingPrice: numeric("selling_price").notNull(),
  actualPrice: numeric("actual_price").notNull(),
  stock: integer("stock").default(0).notNull(),
  supplierName: varchar("supplier_name", { length: 255 }),

  keyFeatures: jsonb("key_features").$type<string[]>().default([]).notNull(),
  colorVariants: jsonb("color_variants")
    .$type<{ hex: string; name: string; path: string }[]>()
    .default([])
    .notNull(),
  sizeVariants: jsonb("size_variants").$type<string[]>().default([]).notNull(),

  description: text("description"),
  mainImage: text("main_image").notNull(),
  galleryImages: jsonb("gallery_images")
    .$type<string[]>()
    .default([])
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  isMostSelling: boolean("is_most_selling").default(false).notNull(),
});

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  color: varchar("color", { length: 50 }).notNull(),
  colorCode: varchar("color_code", { length: 20 }),
  size: varchar("size", { length: 20 }).notNull(),
  stock: integer("stock").default(0).notNull(),
  images: jsonb("images").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// USER INTERACTIONS (CART, WISHLIST, REVIEWS)
// ==========================================
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  color: varchar("color", { length: 100 }).notNull(),
  size: varchar("size", { length: 50 }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "cascade",
  }),
  rating: integer("rating").notNull(),
  reviewText: text("review_text").notNull(),
  adminReply: text("admin_reply"),
  showOnWebsite: boolean("show_on_website").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// MARKETING & DEALS
// ==========================================
export const activeDeals = pgTable("active_deals", {
  id: serial("id").primaryKey(),
  durationHours: integer("duration_hours").notNull().default(24),
  endsAt: timestamp("ends_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dealProducts = pgTable("deal_products", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => activeDeals.id, {
    onDelete: "cascade",
  }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "cascade",
  }),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  type: couponTypeEnum("type").notNull(), // "flat" or "overall_percent"
  discountValue: decimal("discount_value", {
    precision: 10,
    scale: 2,
  }).notNull(),

  // NAYA: Array of product IDs. If empty, it means "All Products"
  applicableProducts: jsonb("applicable_products")
    .$type<number[]>()
    .default([])
    .notNull(),

  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// ORDERS
// ==========================================
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  shippingAddress: jsonb("shipping_address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  couponCode: varchar("coupon_code", { length: 50 }),
  couponDiscount: decimal("coupon_discount", {
    precision: 10,
    scale: 2,
  }).default("0"),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  variantId: integer("variant_id")
    .references(() => productVariants.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: decimal("price_at_purchase", {
    precision: 10,
    scale: 2,
  }).notNull(),
});

// ==========================================
// NEWSLETTER
// ==========================================
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  subscribedEmail: varchar("subscribed_email", { length: 255 }).notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// GLOBAL SETTINGS
// ==========================================
export const storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  marqueeTexts: jsonb("marquee_texts").$type<string[]>().default([]).notNull(),
  isMarqueeActive: boolean("is_marquee_active").default(true).notNull(),

  heroBanners: jsonb("hero_banners")
    .$type<{ id: string; fileUrl: string; path: string }[]>()
    .default([])
    .notNull(),

  heroVideo: jsonb("hero_video")
    .$type<{ fileUrl: string; path: string } | null>()
    .default(null),

  salesBanners: jsonb("sales_banners")
    .$type<{ id: string; fileUrl: string; path: string }[]>()
    .default([])
    .notNull(),

  // NAYA COLUMN FOR CONTACT INFORMATION
  contactInfo: jsonb("contact_info")
    .$type<{
      address: string;
      email: string;
      additionalEmail: string;
      phone: string;
      additionalPhone: string;
      mapSrc: string;
      socials: {
        facebook: string;
        instagram: string;
        youtube: string;
        twitter: string;
        threads: string;
        linkedin: string;
        url: string;
      };
    } | null>()
    .default(null),
});


// ==========================================
// CONTACT MESSAGES
// ==========================================
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// ==========================================
// NOTIFICATION SETTINGS
// ==========================================
export const telegramSettings = pgTable("telegram_settings", {
  id: serial("id").primaryKey(),
  botToken: varchar("bot_token", { length: 255 }),
  chatId: varchar("chat_id", { length: 255 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});