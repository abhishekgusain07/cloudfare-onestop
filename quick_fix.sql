-- Quick fix for the database schema issues
-- Run this SQL directly in your database console

-- Step 1: Create the music table (our new feature)
CREATE TABLE IF NOT EXISTS "music" (
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

-- Step 2: Add foreign key constraint
ALTER TABLE "music" ADD CONSTRAINT "music_user_id_user_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

-- Step 3: Fix the text_elements column (convert text to jsonb safely)
-- First check if the column exists and is text type
DO $$
BEGIN
    -- Only run this if the column is currently text type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'slides' 
        AND column_name = 'text_elements' 
        AND data_type = 'text'
    ) THEN
        -- Convert text to jsonb safely
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
    END IF;
END $$;