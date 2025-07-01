# Feature: AI-Powered Slideshow Generator

## Introduction

This document outlines the plan for implementing a new AI-powered slideshow creation feature. The goal is to provide users with a powerful tool to generate dynamic slideshows for various purposes, such as marketing, social media content, or presentations.

Users will be able to:
- Create and manage multiple slideshow projects.
- Add slides with custom text.
- Upload their own images to a personal collection.
- Generate unique, high-quality images using an integrated AI model by providing a product description and image style.
- Arrange and reorder slides.
- View and share the final slideshow.

This plan details the necessary backend architecture, API endpoints, database schema modifications, and frontend components required to bring this feature to life.

---

Of course. Based on your request and my analysis of the codebase, here is a detailed plan for implementing the slideshow feature.

### **1. Architecture Design**

#### **1.1. Database Schema**

We'll need to add new tables to your database to store slideshows, slides, and user-uploaded images. I'll update `src/db/schema.ts` with the following additions:

```typescript
// In src/db/schema.ts

// ... existing schema ...

export const slideshows = pgTable('slideshows', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const slides = pgTable('slides', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  slideshowId: text('slideshow_id').notNull().references(() => slideshows.id),
  order: integer('order').notNull(),
  imageUrl: text('image_url').notNull(),
  text: text('text'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userImageCollections = pgTable('user_image_collections', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userImages = pgTable('user_images', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  collectionId: text('collection_id').notNull().references(() => userImageCollections.id),
  userId: text('user_id').notNull().references(() => users.id),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

#### **1.2. API Endpoints**

We will create a new set of API endpoints under `src/app/api/slideshow/` to handle all slideshow-related operations.

*   **`POST /api/slideshow`**: Create a new slideshow.
*   **`GET /api/slideshow`**: Get all slideshows for a user.
*   **`GET /api/slideshow/[id]`**: Get a specific slideshow with its slides.
*   **`PUT /api/slideshow/[id]`**: Update a slideshow (e.g., change title, reorder slides).
*   **`DELETE /api/slideshow/[id]`**: Delete a slideshow.
*   **`POST /api/slideshow/generate-image`**: Generate an image using AI.
*   **`POST /api/slideshow/upload-image`**: Upload an image to a user's collection in R2.

#### **1.3. R2 Cloudflare Integration**

Your `backend/wrangler.toml` and other R2-related files suggest an existing setup for R2. We will leverage this for storing user-uploaded images. The upload process will be:

1.  The frontend will make a request to `POST /api/slideshow/upload-image`.
2.  This endpoint will be a serverless function that gets a presigned URL from your Cloudflare R2 bucket.
3.  The frontend will then upload the image directly to R2 using the presigned URL.
4.  The image URL will be saved in the `userImages` table.

#### **1.4. Frontend Components**

We'll create a new section in the dashboard for slideshows.

*   **`src/app/(dashboard)/slideshow/page.tsx`**: A new page to display all created slideshows.
*   **`src/app/(dashboard)/slideshow/create/page.tsx`**: The main page for creating a new slideshow. This will contain:
    *   A component for AI image generation with two text inputs.
    *   A component for uploading user images, which will display their image collections.
    *   A slideshow editor to arrange slides and add text.
*   **`src/app/(dashboard)/slideshow/[id]/edit/page.tsx`**: Page for editing an existing slideshow.
*   **`src/app/(dashboard)/slideshow/[id]/view/page.tsx`**: A public or shareable page to view the final slideshow.

### **2. Step-by-Step Implementation Plan**

Here is a step-by-step guide to implementing this feature.

#### **Phase 1: Backend Setup**

1.  **Update Database Schema**: I will add the new tables to `src/db/schema.ts` as described above and run the migration.
2.  **Create API Endpoints**: I will create the necessary API endpoints under `src/app/api/slideshow/`.
3.  **Implement R2 Uploads**: I will create the logic for generating presigned URLs for R2 uploads in the `POST /api/slideshow/upload-image` endpoint.
4.  **Implement AI Image Generation**: I will create the `POST /api/slideshow/generate-image` endpoint. This will take the product context and image description, and use an AI image generation model (like DALL-E 3 or Stable Diffusion) to generate the image. I will look for an existing AI integration or suggest one.

#### **Phase 2: Frontend Development**

1.  **Create Slideshow Pages**: I will create the new pages for creating, editing, and viewing slideshows.
2.  **Build UI Components**: I will build the new React components for the slideshow creation page, including the AI image generator and the user image upload manager.
3.  **Develop Slideshow Editor**: I will create the interface for arranging slides, adding text overlays, and previewing the slideshow.
4.  **Integrate with Backend**: I will connect all the frontend components to the new API endpoints.

This plan provides a comprehensive overview of the architecture and implementation steps. I will start with the backend setup, beginning with the database schema changes.