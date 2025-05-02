CREATE TYPE "public"."caption_alignment" AS ENUM('LEFT', 'CENTER', 'RIGHT');--> statement-breakpoint
CREATE TYPE "public"."caption_preset" AS ENUM('BASIC', 'MODERN', 'MINIMAL');--> statement-breakpoint
CREATE TYPE "public"."screen_ratio" AS ENUM('1/1', '16/9', '9/16', '4/5');--> statement-breakpoint
CREATE TYPE "public"."video_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "video_assets" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"video_id" varchar(36) NOT NULL,
	"type" varchar(10) NOT NULL,
	"url" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_clips" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"video_id" varchar(36) NOT NULL,
	"asset_id" varchar(36) NOT NULL,
	"start_time" integer NOT NULL,
	"duration" integer NOT NULL,
	"track_index" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "video_status" DEFAULT 'pending' NOT NULL,
	"disable_captions" boolean DEFAULT false NOT NULL,
	"audio_duration" integer DEFAULT 0 NOT NULL,
	"screen_ratio" "screen_ratio" DEFAULT '1/1' NOT NULL,
	"caption_preset" "caption_preset" DEFAULT 'BASIC' NOT NULL,
	"caption_alignment" "caption_alignment" DEFAULT 'CENTER' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "video_assets" ADD CONSTRAINT "video_assets_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_clips" ADD CONSTRAINT "video_clips_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_clips" ADD CONSTRAINT "video_clips_asset_id_video_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."video_assets"("id") ON DELETE no action ON UPDATE no action;