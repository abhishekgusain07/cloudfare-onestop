-- Fix text_elements column type conversion
-- Run this SQL directly in your database

-- First, let's see what data exists
-- SELECT id, text_elements FROM slides LIMIT 5;

-- Convert text to jsonb safely
ALTER TABLE slides 
ALTER COLUMN text_elements 
TYPE jsonb 
USING CASE 
  WHEN text_elements IS NULL OR text_elements = '' THEN '[]'::jsonb
  ELSE 
    CASE 
      WHEN text_elements::text ~ '^[\[\{]' THEN text_elements::jsonb
      ELSE ('["' || replace(text_elements, '"', '\"') || '"]')::jsonb
    END
END;