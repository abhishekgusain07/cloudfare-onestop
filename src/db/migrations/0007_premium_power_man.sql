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
ALTER TABLE "music" ADD CONSTRAINT "music_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;