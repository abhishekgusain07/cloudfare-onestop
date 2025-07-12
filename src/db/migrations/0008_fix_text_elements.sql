-- Custom migration to fix text_elements column type
-- This safely converts text to jsonb

-- Step 1: Add music table (our new feature)
CREATE TABLE "music" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"filename" text NOT NULL,
	"url" text NOT NULL,
	"duration" integer NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"uploaded_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"last_used" timestamp
);
--> statement-breakpoint

-- Step 2: Add foreign key constraint
ALTER TABLE "music" ADD CONSTRAINT "music_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Step 3: Fix text_elements column - convert text to jsonb safely
ALTER TABLE "slides" 
ALTER COLUMN "text_elements" 
TYPE jsonb 
USING CASE 
  WHEN "text_elements" IS NULL OR "text_elements" = '' THEN '[]'::jsonb
  ELSE 
    CASE 
      WHEN "text_elements"::text ~ '^[\[\{]' THEN "text_elements"::jsonb
      ELSE ('["' || replace("text_elements", '"', '\"') || '"]')::jsonb
    END
END;