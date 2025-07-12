import { pgTable, text, integer, timestamp, boolean, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from 'drizzle-orm';
import { pgEnum } from 'drizzle-orm/pg-core';
			
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	subscription: text("subscription"),
	updatedAt: timestamp('updated_at').notNull(),
	onboardingCompleted: boolean('onboarding_completed').notNull().default(false)
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});

export const subscriptions = pgTable("subscriptions", {
	id: text("id").primaryKey(),
	createdTime: timestamp("created_time").defaultNow(),
	subscriptionId: text("subscription_id"),
	stripeUserId: text("stripe_user_id"),
	status: text("status"),
	startDate: text("start_date"),
	endDate: text("end_date"),
	planId: text("plan_id"),
	defaultPaymentMethodId: text("default_payment_method_id"),
	email: text("email"),
	userId: text("user_id"),
  });
  
export const subscriptionPlans = pgTable("subscriptions_plans", {
	id: text("id").primaryKey(),
	createdTime: timestamp("created_time").defaultNow(),
	planId: text("plan_id"),
	name: text("name"),
	description: text("description"),
	amount: text("amount"),
	currency: text("currency"),
	interval: text("interval"),
  });
  
export const invoices = pgTable("invoices", {
	id: text("id").primaryKey(),
	createdTime: timestamp("created_time").defaultNow(),
	invoiceId: text("invoice_id"),
	subscriptionId: text("subscription_id"),
	amountPaid: text("amount_paid"),
	amountDue: text("amount_due"),
	currency: text("currency"),
	status: text("status"),
	email: text("email"),
	userId: text("user_id"),
  });

export const feedback = pgTable("feedback", {
	id: text("id").primaryKey(),
	createdTime: timestamp("created_time").defaultNow(),
	userId: text("user_id"),
	feedbackContent: text("feedback_content"),
	stars: integer().notNull()
})

// Define enums
export const videoStatusEnum = pgEnum('video_status', ['pending', 'processing', 'completed', 'failed'] as [string, string, string, string]);
export const screenRatioEnum = pgEnum('screen_ratio', ['1/1', '16/9', '9/16', '4/5'] as [string, string, string, string]);
export const captionPresetEnum = pgEnum('caption_preset', ['BASIC', 'MODERN', 'MINIMAL'] as [string, string, string]);
export const captionAlignmentEnum = pgEnum('caption_alignment', ['LEFT', 'CENTER', 'RIGHT'] as [string, string, string]);

// Slideshow enums
export const slideshowStatusEnum = pgEnum('slideshow_status', ['draft', 'rendering', 'completed', 'failed'] as [string, string, string, string]);
export const outputFormatEnum = pgEnum('output_format', ['video', 'images'] as [string, string]);

export const videos = pgTable('videos', {
	id: varchar('id', { length: 36 }).primaryKey(),
	userId: varchar('user_id', { length: 36 }).notNull(),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	status: videoStatusEnum('status').notNull().default('pending'),
	disableCaptions: boolean('disable_captions').notNull().default(false),
	audioDuration: integer('audio_duration').notNull().default(0),
	screenRatio: screenRatioEnum('screen_ratio').notNull().default('1/1'),
	captionPreset: captionPresetEnum('caption_preset').notNull().default('BASIC'),
	captionAlignment: captionAlignmentEnum('caption_alignment').notNull().default('CENTER'),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const videoAssets = pgTable('video_assets', {
	id: varchar('id', { length: 36 }).primaryKey(),
	videoId: varchar('video_id', { length: 36 })
		.notNull()
		.references(() => videos.id),
	type: varchar('type', { length: 10 }).notNull(),
	url: text('url').notNull(),
	metadata: jsonb('metadata'),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const videoClips = pgTable('video_clips', {
	id: varchar('id', { length: 36 }).primaryKey(),
	videoId: varchar('video_id', { length: 36 })
		.notNull()
		.references(() => videos.id),
	assetId: varchar('asset_id', { length: 36 })
		.notNull()
		.references(() => videoAssets.id),
	startTime: integer('start_time').notNull(),
	duration: integer('duration').notNull(),
	trackIndex: integer('track_index').notNull(),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const selectVideoSchema = createSelectSchema(videos);
export const insertVideoSchema = createInsertSchema(videos);

export const selectVideoAssetSchema = createSelectSchema(videoAssets);
export const insertVideoAssetSchema = createInsertSchema(videoAssets);

// Slideshow Feature Tables
export const slideshows = pgTable('slideshows', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	status: slideshowStatusEnum('status').notNull().default('draft'),
	outputFormat: outputFormatEnum('output_format').notNull().default('video'),
	renderUrl: text('render_url'),
	createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const slides = pgTable('slides', {
	id: text('id').primaryKey(),
	slideshowId: text('slideshow_id').notNull().references(() => slideshows.id, { onDelete: 'cascade' }),
	order: integer('order').notNull(),
	imageUrl: text('image_url').notNull(),
	textElements: jsonb('text_elements').notNull().default('[]'),
	createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const userImageCollections = pgTable('user_image_collections', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const userImages = pgTable('user_images', {
	id: text('id').primaryKey(),
	collectionId: text('collection_id').notNull().references(() => userImageCollections.id, { onDelete: 'cascade' }),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	url: text('url').notNull(),
	createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Zod schemas for the new tables
export const selectSlideshowSchema = createSelectSchema(slideshows);
export const insertSlideshowSchema = createInsertSchema(slideshows);

export const selectSlideSchema = createSelectSchema(slides);
export const insertSlideSchema = createInsertSchema(slides);

export const selectUserImageCollectionSchema = createSelectSchema(userImageCollections);
export const insertUserImageCollectionSchema = createInsertSchema(userImageCollections);

export const selectUserImageSchema = createSelectSchema(userImages);
export const insertUserImageSchema = createInsertSchema(userImages);


export const music = pgTable('music', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  filename: text('filename').notNull(),
  url: text('url').notNull(), 
  duration: integer('duration').notNull(), 
  fileSize: integer('file_size').notNull(), 
  mimeType: text('mime_type').notNull(),
  uploadedAt: timestamp('uploaded_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  lastUsed: timestamp('last_used'),
});

export const selectMusicSchema = createSelectSchema(music);
export const insertMusicSchema = createInsertSchema(music);
