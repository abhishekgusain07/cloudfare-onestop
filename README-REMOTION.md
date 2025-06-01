# UGC AI Ad App with Remotion

This application allows users to create UGC (User Generated Content) style videos by adding text overlays to video templates and background music. The app uses Remotion for video rendering and supports both local rendering and AWS Lambda rendering for production.

## Features

- Add text overlays to video templates
- Position and align text (top, center, bottom)
- Customize text appearance (font size, color, opacity)
- Add background music with volume control
- Choose from different video templates
- Preview videos in real-time
- Render videos locally or using AWS Lambda
- Download rendered videos

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── render/
│   │   │   ├── [renderId]/
│   │   │   │   └── status/
│   │   │   │       └── route.ts
│   │   │   └── route.ts
│   │   └── download/
│   │       └── [renderId]/
│   │           └── route.ts
│   └── create/
│       └── page.tsx
├── components/
│   └── remotion/
│       ├── videoComposition.tsx
│       ├── texteditor.tsx
│       ├── positionselector.tsx
│       ├── musicselector.tsx
│       └── videotemplate.tsx
└── remotion/
    └── index.tsx
public/
├── videos/
│   ├── urban-lifestyle.mp4
│   ├── nature-scene.mp4
│   └── tech-demo.mp4
├── music/
│   ├── upbeat-pop.mp3
│   └── [other music files]
└── thumbnails/
    ├── urban-lifestyle.jpg
    ├── nature-scene.jpg
    └── tech-demo.jpg
```

## Setup

1. Make sure you have all required dependencies installed:
   ```
   npm install
   ```

2. Add sample videos to the `public/videos/` directory
3. Add sample music files to the `public/music/` directory
4. Add thumbnail images to the `public/thumbnails/` directory

## Environment Variables

For local development, create a `.env.local` file with:

```
# For local development
REMOTION_SERVE_URL=http://localhost:3000
```

For AWS Lambda rendering (optional), add:

```
# For AWS Lambda rendering
REMOTION_AWS_REGION=us-east-1
REMOTION_AWS_FUNCTION_NAME=your-lambda-function-name
REMOTION_AWS_ACCESS_KEY_ID=your-access-key
REMOTION_AWS_SECRET_ACCESS_KEY=your-secret-key
REMOTION_AWS_S3_BUCKET=your-s3-bucket
```

## Usage

1. Start the development server:
   ```
   npm run dev
   ```

2. Navigate to `/create` to use the video editor
3. Customize your video with text, position, and music
4. Preview the video in real-time
5. Click "Render Video" to generate the final video
6. Download the rendered video

## AWS Lambda Setup (Optional)

For production use with AWS Lambda:

1. Set up an AWS Lambda function for Remotion rendering
2. Configure an S3 bucket for storing rendered videos
3. Set the appropriate environment variables
4. Deploy your application

## Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run remotion:preview`: Preview Remotion compositions
- `npm run remotion:render`: Render a video locally
- `npm run remotion:upgrade`: Upgrade Remotion packages
