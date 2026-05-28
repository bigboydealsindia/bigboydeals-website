ALTER TABLE "store_settings" ADD COLUMN "hero_banners" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "hero_video" jsonb DEFAULT 'null'::jsonb;