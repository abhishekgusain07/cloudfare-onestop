CREATE TYPE "public"."output_format" AS ENUM('video', 'images');--> statement-breakpoint
CREATE TYPE "public"."slideshow_status" AS ENUM('draft', 'rendering', 'completed', 'failed');--> statement-breakpoint
ALTER TABLE "slides" RENAME COLUMN "text" TO "text_elements";--> statement-breakpoint
ALTER TABLE "slideshows" ADD COLUMN "status" "slideshow_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "slideshows" ADD COLUMN "output_format" "output_format" DEFAULT 'video' NOT NULL;--> statement-breakpoint
ALTER TABLE "slideshows" ADD COLUMN "render_url" text;--> statement-breakpoint
ALTER TABLE "user_image_collections" ADD COLUMN "description" text;