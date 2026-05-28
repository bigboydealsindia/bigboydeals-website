ALTER TABLE "banners" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "banners" CASCADE;--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand_id" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "selling_price" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "actual_price" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "key_features" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "color_variants" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "size_variants" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "main_image" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "gallery_images" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "short_description";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "long_description";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "old_price";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "new_price";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "tags";--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_slug_unique" UNIQUE("slug");