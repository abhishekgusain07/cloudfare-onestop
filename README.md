# Video Editor with Remotion

A powerful video editor built with Next.js, TypeScript, and Remotion that allows users to create and edit videos in the browser.

## Features

- Upload and manage media assets (videos, images, audio)
- Drag-and-drop timeline interface
- Real-time preview with Remotion
- Text overlay editor with styling options
- Server-side video rendering
- Modern UI with Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Uploading Media

1. Click on the upload area or drag and drop files
2. Supported formats:
   - Videos: MP4, MOV, AVI
   - Images: PNG, JPG, JPEG, GIF
   - Audio: MP3, WAV, OGG

### Timeline Editor

1. Drag media clips to position them on the timeline
2. Use the zoom controls to adjust the timeline scale
3. Click and drag clips to adjust their timing
4. The red playhead shows the current position

### Text Overlays

1. Enter text content in the text editor
2. Customize font, size, and color
3. Click "Add Text to Timeline" to add the text overlay
4. Position and adjust timing in the timeline

### Preview and Export

1. Use the preview player to see your composition
2. Click the play button to preview
3. When ready, click the export button to render the final video
4. The rendered video will be downloaded automatically

## Development

### Project Structure

- `src/app/(dashboard)/ad/page.tsx` - Main editor page
- `src/components/` - UI components
  - `MediaUpload.tsx` - File upload component
  - `Preview.tsx` - Video preview with Remotion
  - `Timeline.tsx` - Timeline editor
  - `TextEditor.tsx` - Text overlay editor
- `src/store/editorStore.ts` - State management with Zustand
- `src/app/api/render/route.ts` - Video rendering API endpoint

### Dependencies

- Next.js - React framework
- TypeScript - Type safety
- Remotion - Video rendering
- Zustand - State management
- React DnD - Drag and drop
- Tailwind CSS - Styling

## License

MIT

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Analytics and Monitoring Configuration

This template includes built-in support for analytics and error monitoring through PostHog and Sentry. Both services are optional and can be enabled or disabled through environment variables and configuration.

### Configuration Options

All analytics and monitoring features can be controlled in the `src/config.ts` file:

```typescript
const config = {
  auth: {
    enabled: true,
  },
  payments: {
    enabled: true,
  },
  analytics: {
    posthog: {
      enabled: process.env.NEXT_PUBLIC_POSTHOG_KEY ? true : false,
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    },
  },
  monitoring: {
    sentry: {
      enabled: process.env.NEXT_PUBLIC_SENTRY_DSN ? true : false,
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    },
  },
};
```

### PostHog Analytics

PostHog provides product analytics, session recording, feature flags, and more.

To enable PostHog:
1. Create a PostHog account and project at [PostHog.com](https://posthog.com)
2. Add your API key to the `.env` file: `NEXT_PUBLIC_POSTHOG_KEY=phc_your_api_key`
3. Optionally set a custom host with `NEXT_PUBLIC_POSTHOG_HOST`

To disable PostHog:
- Simply leave the `NEXT_PUBLIC_POSTHOG_KEY` empty in your `.env` file

### Sentry Error Monitoring

Sentry provides error tracking, performance monitoring, and more.

To enable Sentry:
1. Create a Sentry account and project at [Sentry.io](https://sentry.io)
2. Add your DSN to the `.env` file: `NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-url`
3. For source map uploads, add: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT`

To disable Sentry:
- Simply leave the `NEXT_PUBLIC_SENTRY_DSN` empty in your `.env` file

### Testing Error Monitoring

To test Sentry integration, visit the `/sentry-example-page` route in your application, which includes buttons to trigger test errors.

# One Stop Marketing - Docker Setup

## Prerequisites
- Docker
- Docker Compose
- Node.js (optional, for local development)

## Project Structure
- `Dockerfile.frontend`: Dockerfile for Next.js frontend
- `backend/Dockerfile`: Dockerfile for Express backend
- `docker-compose.yml`: Docker Compose configuration

## Environment Setup

### Development Environment
1. Clone the repository
2. Ensure you have Docker and Docker Compose installed
3. Create a `public/ugc/videos` directory to store video files

### Running the Application
```bash
# Build and start the services
docker-compose up --build

# Stop the services
docker-compose down

# Rebuild services without cache
docker-compose build --no-cache
```

### Accessing the Application
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

## Troubleshooting
- Ensure all video files are placed in `public/ugc/videos/`
- Check Docker logs for any startup issues
- Verify network connectivity between services

## Notes
- The application uses a bridge network for inter-service communication
- Volumes are used to persist and share video files
- Non-root users are used for enhanced security
