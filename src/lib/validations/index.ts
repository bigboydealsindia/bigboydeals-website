import { z } from "zod";

// ==========================================
// AUTH SCHEMAS
// ==========================================

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address format." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
});

export const signupSchema = loginSchema.extend({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." }),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, {
      message: "Phone number must be exactly 10 digits.",
    }),
});

// ==========================================
// ADMIN: CATEGORY SCHEMAS
// ==========================================

export const categorySchema = z.object({
  name: z.string().min(2, { message: "Category name is required." }),
  slug: z
    .string()
    .min(2, { message: "Slug is required." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens.",
    }),
});

// ==========================================
// ADMIN: PRODUCT & VARIANT SCHEMAS
// ==========================================

export const productSchema = z.object({
  title: z.string().min(3, { message: "Product title is required." }),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  // Forms se data hamesha string format mein aata hai, isliye z.coerce.number() use kiya hai
  oldPrice: z.coerce.number().min(0).optional(),
  newPrice: z.coerce
    .number()
    .min(1, { message: "Selling price must be greater than 0." }),
  categoryId: z.coerce
    .number()
    .min(1, { message: "Please select a category." }),
  tags: z.array(z.string()).default([]),
});

export const productVariantSchema = z.object({
  productId: z.coerce.number().optional(), // Creates ke time backend handle kar sakta hai
  color: z.string().min(1, { message: "Color name is required." }),
  colorCode: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, {
      message: "Must be a valid hex color code.",
    })
    .optional(),
  size: z.string().min(1, { message: "Size is required." }),
  stock: z.coerce
    .number()
    .min(0, { message: "Stock cannot be negative." })
    .int(),
  images: z
    .array(z.string().url({ message: "Must be a valid image URL." }))
    .min(1, { message: "At least one image is required." }),
});

// ==========================================
// ADMIN: COUPON SCHEMAS
// ==========================================

export const couponTypeEnum = z.enum([
  "per_product",
  "overall_percent",
  "flat",
]);

export const couponSchema = z
  .object({
    code: z
      .string()
      .min(3, { message: "Coupon code must be at least 3 characters." })
      .toUpperCase(),
    type: couponTypeEnum,
    discountValue: z.coerce
      .number()
      .min(0.1, { message: "Discount value must be greater than 0." }),
    productId: z.coerce.number().optional().nullable(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Custom logic: agar per_product type hai, toh productId zaroori hai
      if (data.type === "per_product" && !data.productId) {
        return false;
      }
      return true;
    },
    {
      message: "Product must be selected for per-product coupons.",
      path: ["productId"],
    },
  );

// ==========================================
// ADMIN: BANNER SCHEMAS
// ==========================================

export const bannerSchema = z.object({
  imageUrl: z.string().url({ message: "Valid image URL is required." }),
  link: z
    .string()
    .url({ message: "Valid link URL is required." })
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
});

// ==========================================
// STORE: CHECKOUT & ADDRESS SCHEMAS
// ==========================================

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required." }),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, {
      message: "Valid 10-digit phone number is required.",
    }),
  streetAddress: z
    .string()
    .min(5, { message: "Complete street address is required." }),
  city: z.string().min(2, { message: "City name is required." }),
  state: z.string().min(2, { message: "State name is required." }),
  pincode: z
    .string()
    .regex(/^[0-9]{6}$/, { message: "Valid 6-digit pincode is required." }),
});

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["razorpay", "cod"]),
});

// ==========================================
// EXTRACTED TYPES
// ==========================================
// In types ko hum frontend forms aur state management mein direct use karenge.

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type ProductVariantFormData = z.infer<typeof productVariantSchema>;
export type CouponFormData = z.infer<typeof couponSchema>;
export type BannerFormData = z.infer<typeof bannerSchema>;
export type ShippingAddressData = z.infer<typeof shippingAddressSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
