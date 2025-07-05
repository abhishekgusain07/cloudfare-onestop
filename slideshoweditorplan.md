# Slideshow Editor: Feature Implementation Plan

## 1. Feature Overview

The goal is to create a rich, interactive slideshow editor that allows users to build compelling visual narratives. This editor will replace the current, basic implementation with a powerful, intuitive interface inspired by presentation software like PowerPoint or Google Slides.

Users will be able to manage a sequence of image-based slides, overlay them with highly customizable text boxes, and arrange them in any order. The final output can be rendered as a single video file (for TikTok/Reels) or a series of images (for Instagram carousels), ready for social media.

### Core User Stories:
- As a user, I want to see all my slides for the current slideshow in a reorderable list or carousel.
- As a user, I want to add new images to my slideshow from my uploaded collections.
- As a user, I want to remove a slide from my slideshow at any point.
- As a user, I want to change the order of my slides using a simple drag-and-drop interface.
- As a user, I want to select a slide and see a large preview of it.
- As a user, I want to add multiple text boxes to any slide.
- As a user, I want to drag and resize a text box to any position on the slide preview.
- As a user, I want to edit the content of a text box directly on the slide preview.
- As a user, I want to change the font family, font size, and color of the text in a selected text box.
- As a user, I want all my changes to be saved automatically.
- **As a user, I want to render my completed slideshow into a video file or a sequence of images.**
- **As a user, I want to download the rendered output so I can post it on social media.**

---

## 2. Data Model Expansion

To support the new features, the data model needs to be expanded.

### `TextElement`
A new type to define a single text box on a slide.
```typescript
interface TextElement {
  id: string;
  text: string;
  position: { x: number; y: number }; // Position (top-left) as a % of canvas dimensions
  size: { width: number; height: number }; // Size as a % of canvas dimensions
  fontFamily: string;
  fontSize: number;    // Font size in pixels (relative to a base canvas size)
  color: string;       // Hex or RGBA color string
  zIndex: number;      // Stacking order
}
```

### `Slide` (Updated)
The `Slide` type will hold an array of `TextElement` objects.
```typescript
interface Slide {
  id: string;
  slideshowId: string;
  imageUrl: string;
  order: number; // Explicitly define the order of the slide
  textElements: TextElement[]; // Array of text elements for this slide
}
```

### `Slideshow` (Updated)
The `Slideshow` type will be updated to track rendering status and output.
```typescript
interface Slideshow {
  id: string;
  name: string;
  userId: string;
  // ... other existing fields
  status: 'draft' | 'rendering' | 'completed' | 'failed';
  outputFormat: 'video' | 'images'; // User's desired output
  renderUrl?: string | null; // URL to the final rendered file (video or zip of images)
}
```

---

## 3. Core Components Breakdown

1.  **`SlideshowEditorLayout`:** The main three-panel container.
2.  **`SlideStrip` (Left Panel):** A reorderable list of slide thumbnails.
3.  **`EditingCanvas` (Center Panel):** The main interactive preview area for a selected slide.
4.  **`DraggableTextBox` (Canvas Element):** A single draggable, resizable, and editable text box component.
5.  **`StylingToolbar` (Right Panel):** Context-aware panel to style a selected text box.
6.  **`RenderControls` (New Component):**
    - A new component, likely in the header or right panel.
    - Contains an "Export" or "Render" button.
    - Includes a selector for the `outputFormat` ('Video' or 'Image Sequence').
    - Displays the current `status` of the slideshow (e.g., "Rendering...", "Render Complete").
    - Shows a "Download" button linked to the `renderUrl` when rendering is complete.

---

## 4. Phased Implementation Plan

This plan is broken down into phases for incremental development.

### Phase 1: Core Editor UI & Data Structure
1.  **Update Data Models:** Implement the new `TextElement` and updated `Slide` and `Slideshow` types in `src/app/slideshow/types.ts`.
2.  **Backend Migration:** Update the database schema (`src/db/schema.ts`).
    - `slides` table: add `textElements` (JSONB) and `order` (integer).
    - `slideshows` table: add `status` (string), `outputFormat` (string), and `renderUrl` (string, nullable).
3.  **Build Static Layout:** Create the `SlideshowEditorLayout` with the three-panel design using CSS Grid.
4.  **Implement `SlideStrip`:** Display slides, handle selection and deletion.

### Phase 2: Interactive Canvas & Text
1.  **Implement Reordering:** Integrate `dnd-kit` into the `SlideStrip` to allow drag-and-drop reordering of slides.
2.  **Create `EditingCanvas`:** Render the selected slide's background image.
3.  **Create `DraggableTextBox`:** Use a library like `react-rnd` to create draggable, resizable text boxes on the canvas.
4.  **Implement In-place Editing:** Allow users to double-click a text box to edit its content directly.

### Phase 3: Styling and State Management
1.  **Build `StylingToolbar`:** Create the UI controls for font family, size, and color.
2.  **Implement Text Creation:** Add a button to the toolbar to create a new `TextElement` on the current slide.
3.  **Centralize State:** Use a state manager (like Zustand) to manage the editor's state.
4.  **Implement Autosave:** Debounce state changes and persist them to the backend via a `PATCH /api/slideshow/{slideshowId}` endpoint.

### Phase 4: Rendering and Export
1.  **Build `RenderControls` Component:** Create the UI for initiating a render, selecting the format, and displaying progress/results.
2.  **Create Render API Endpoint:**
    - `POST /api/slideshow/{slideshowId}/render`
    - This endpoint sets the slideshow `status` to `'rendering'` and triggers a background job.
3.  **Implement Remotion Composition:**
    - Create a new Remotion composition (e.g., `src/remotion/SlideshowComposition.tsx`).
    - This component will receive the full slideshow data as props.
    - It will dynamically generate a `<Sequence>` for each slide, rendering the image and overlaying the text elements with correct styling and positioning.
4.  **Implement Backend Rendering Logic:**
    - The background job will use Remotion's programmatic rendering APIs.
    - It will render the composition to the format specified in `outputFormat`.
    - The final file (MP4 or ZIP) will be uploaded to a storage service (e.g., Cloudflare R2).
    - The database will be updated with `status: 'completed'` and the file's `renderUrl`.
5.  **Implement Frontend Feedback:** The `RenderControls` component will poll a status endpoint (`GET /api/slideshow/{slideshowId}`) to update its display, showing the download button when ready.

---

## 5. Best Practices & Considerations

-   **Performance:** Debounce expensive operations like saving. Virtualize lists if they can grow long.
-   **UX/UI:** Provide clear visual feedback for selections, loading states, and render progress. Consider adding undo/redo functionality in a future iteration.
-   **Responsiveness:** Ensure the editor is usable on various screen sizes.
-   **Code Quality:** Keep components small and focused. Use TypeScript to maintain data integrity.

