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

# OneStop UGC Creator

An AI-powered UGC (User Generated Content) creator app that streamlines the process of making TikTok-style videos. Users can add text overlays to AI-generated videos and render them using Remotion.

## Features

- **AI Video Templates**: Pre-generated video templates stored in Cloudflare R2
- **Text Overlays**: Add customizable text with various positions, fonts, and colors
- **Music Integration**: Add background music to your videos
- **Real-time Preview**: See your edits in real-time using Remotion Player
- **High-Quality Rendering**: Export videos in 1080x1920 resolution at 30 FPS

## Architecture

The application uses a modern tech stack:
- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Express.js server for video rendering
- **Video Processing**: Remotion for video composition and rendering
- **Storage**: Cloudflare R2 for video templates and thumbnails
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Cloudflare account with R2 bucket
- PostgreSQL database

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd cloudfare_onestopmarketing
npm install
cd backend && npm install && cd ..
```

### 2. Cloudflare R2 Setup

#### Step 1: Create R2 Bucket
1. Log into your Cloudflare Dashboard
2. Navigate to R2 Object Storage
3. Create a new bucket (e.g., `your-ugc-templates-bucket`)
4. Note down your bucket name

#### Step 2: Configure R2 API Tokens
1. Go to "Manage R2 API Tokens"
2. Create a new API token with:
   - **Permissions**: Object Read & Write
   - **Bucket**: Your created bucket
   - **Account ID**: Your Cloudflare Account ID
3. Save the Access Key ID and Secret Access Key

#### Step 3: Set Up R2 Public Access (Optional but Recommended)
1. In your R2 bucket settings, enable "Public Access"
2. This will generate a public URL like: `https://pub-<bucket-id>.r2.dev`
3. Alternatively, you can configure a custom domain

#### Step 4: Configure CORS Policy
In your R2 bucket settings > CORS policy, add:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://your-frontend-domain.com"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]
```

#### Step 5: Upload Your Content
Upload your video templates and thumbnails to R2 with this structure:
```
your-bucket/
├── videos/
│   ├── 1.mp4
│   ├── 2.mp4
│   └── ...
└── thumbnails/
    ├── 1.jpg
    ├── 2.jpg
    └── ...
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Authentication
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-ugc-templates-bucket
R2_ENDPOINT=https://your-cloudflare-account-id.r2.cloudflarestorage.com
R2_PUBLIC_URL_BASE=https://pub-your-bucket-id.r2.dev

# Payment Processing (Optional)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your-stripe-public-key
NEXT_PUBLIC_STRIPE_PRICE_ID=your-stripe-price-id

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Error Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-name

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup

```bash
# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Seed database
npm run db:seed
```

### 5. Start Development Servers

```bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## R2 Integration Details

### How It Works

1. **Video Fetching**: The backend fetches video lists from R2 using the AWS SDK
2. **Frontend Display**: Thumbnails and video previews are loaded directly from R2 URLs
3. **Rendering**: Remotion processes videos using the R2 URLs for final rendering
4. **CORS**: Properly configured CORS allows browsers to access R2 content

### Folder Structure in R2

```
your-bucket/
├── videos/           # Video templates (.mp4 files)
│   ├── 1.mp4
│   ├── 2.mp4
│   ├── 3.mp4
│   └── ...
├── thumbnails/       # Video thumbnails (.jpg files)
│   ├── 1.jpg        # Thumbnail for 1.mp4
│   ├── 2.jpg        # Thumbnail for 2.mp4
│   ├── 3.jpg        # Thumbnail for 3.mp4
│   └── ...
└── renders/          # Optional: Store rendered videos
    └── ...
```

### Troubleshooting R2 Issues

1. **Videos not loading**: Check CORS policy and public access settings
2. **Thumbnails not showing**: Verify thumbnail files exist with correct naming
3. **Rendering fails**: Ensure R2 URLs are publicly accessible
4. **Connection errors**: Verify API keys and endpoint URLs

## Usage

1. **Select Template**: Choose a video template from the gallery
2. **Add Text**: Customize text content, position, and styling
3. **Add Music**: Optionally add background music
4. **Preview**: See real-time preview of your video
5. **Render**: Generate final video file
6. **Download**: Download your created video

## Development

### Project Structure

```
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── create/         # Main video creation page
│   │   └── ...
│   ├── components/         # Reusable components
│   │   ├── remotion/      # Remotion-specific components
│   │   └── ui/            # UI components
│   └── utils/             # Utility functions
├── backend/               # Express.js backend
│   └── src/
│       └── server.ts     # Main server file
└── ...
```

### Key Components

- `VideoComposition`: Main Remotion component for video rendering
- `VideoSelector`: Component for selecting video templates
- `TextEditor`: Text overlay customization
- `MusicSelector`: Background music selection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Your License Here]
