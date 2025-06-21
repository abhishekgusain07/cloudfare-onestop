# AI UGC Creator - System Architecture

## Overview
The AI UGC Creator is a full-stack application that streamlines the creation of User Generated Content (UGC) videos commonly seen on TikTok. The system allows users to select pre-generated AI UGC videos, customize them with text overlays, preview changes in real-time, and render final videos.

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (React)
- **Styling**: Tailwind CSS
- **Video Preview**: Remotion Player
- **Language**: TypeScript

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Video Processing**: Remotion (bundler & renderer)
- **Language**: TypeScript

### Video Processing
- **Library**: Remotion
- **Codec**: H.264
- **Output Format**: MP4
- **Resolution**: 1080x1920 (TikTok/Instagram Stories format)
- **Frame Rate**: 30 FPS

## System Architecture

### High-Level Components

1. **Frontend Application** (`/src/`)
   - User interface for video creation
   - Real-time preview capabilities
   - Video customization controls

2. **Backend API Server** (`/backend/`)
   - Video rendering service
   - File management
   - Render job tracking

3. **Static Assets** (`/public/`)
   - AI-generated UGC video templates
   - Audio files and thumbnails
   - Rendered output storage

4. **Remotion Components** (`/src/components/remotion/`)
   - Video composition definitions
   - Text overlay rendering
   - Template management

## Data Flow

### 1. Video Selection & Customization
```
User accesses /create page
↓
Loads available UGC videos from /public/ugc/videos/
↓
User selects template and customizes:
- Text content
- Text position (top/center/bottom)
- Text alignment (left/center/right)
- Font size and color
- Background music
- Music volume
↓
Real-time preview using Remotion Player
```

### 2. Video Rendering Process
```
User clicks "Render"
↓
Frontend sends POST request to /render endpoint
↓
Backend generates unique render ID
↓
Asynchronous rendering process begins:
1. Bundle Remotion components (@remotion/bundler)
2. Select composition with user parameters
3. Render frames to video (@remotion/renderer)
4. Encode to H.264 MP4
5. Save to /renders/ directory
↓
Frontend polls /render/:id for status updates
↓
User downloads completed video
```

## Key Components Detail

### Frontend (`/src/app/create/page.tsx`)
- **Video Library**: Displays available UGC templates
- **Customization Panel**: Text editing, positioning, styling controls
- **Preview Player**: Real-time Remotion preview
- **Render Controls**: Trigger rendering and track progress

### Backend API (`/backend/src/server.ts`)
- **Endpoints**:
  - `POST /render` - Start new render job
  - `GET /render/:id` - Check render status
  - `GET /renders` - List all renders
  - `DELETE /render/:id` - Delete render and file
- **Features**:
  - In-memory render job tracking
  - Progress monitoring
  - Error handling
  - File cleanup

### Remotion Components (`/src/components/remotion/`)
- **Root.tsx**: Composition registration and configuration
- **VideoComposition.tsx**: Main video component with text overlays
- **Supporting Components**: Text editor, position selector, music integration

### Asset Management (`/public/`)
```
/public/
├── ugc/videos/          # AI-generated UGC video templates
├── music/               # Background audio files
├── thumbnails/          # Video preview thumbnails
└── renders/             # Rendered output videos (via backend)
```

## Technical Implementation Details

### Remotion Configuration
- **Composition ID**: "VideoComposition"
- **Dimensions**: 1080x1920 (9:16 aspect ratio)
- **Duration**: Dynamic based on template length
- **Props**: Video parameters, text content, styling options

### Render Parameters
```typescript
interface RenderRequest {
  videoParams: {
    selectedTemplate: string;
    text: string;
    textPosition: 'top' | 'center' | 'bottom';
    textAlign: 'left' | 'center' | 'right';
    fontSize: number;
    textColor: string;
    musicUrl?: string;
    musicVolume: number;
  };
  template: {
    id: string;
    name: string;
    url: string;
    duration: number;
  };
}
```

### Render Status Tracking
- **Status Types**: 'rendering' | 'completed' | 'failed'
- **Progress**: 0-100% completion
- **Storage**: In-memory cache with render metadata
- **Cleanup**: Automatic file deletion on request

## Security & Performance

### CORS Configuration
- Allows frontend (localhost:3000) access
- Supports static asset serving
- Headers for UGC video access

### Performance Optimizations
- Asynchronous rendering (non-blocking)
- Progress tracking for user feedback
- Static asset caching
- Render job queuing system

### File Management
- Unique render IDs prevent conflicts
- Automatic cleanup of failed renders
- Structured asset organization

## Deployment Considerations

### Development
- Frontend: `npm run dev` (Next.js)
- Backend: `npm run dev` (Express with nodemon)
- Assets: Served statically from /public

### Production
- Frontend: Next.js deployment (Vercel/Netlify)
- Backend: Node.js server (AWS/Railway/Render)
- Assets: CDN storage for video templates
- Renders: Cloud storage for output files

## Future Enhancements

1. **Scalability**
   - Queue system for render jobs (Redis/Bull)
   - Horizontal scaling with load balancers
   - Database for persistent render history

2. **Features**
   - User authentication and project saving
   - More text styling options
   - Advanced video effects
   - Batch processing capabilities

3. **Performance**
   - Video transcoding optimization
   - Caching strategies
   - Real-time collaboration features

## Error Handling

### Frontend
- Network error recovery
- Render progress monitoring
- User feedback for failures

### Backend
- Comprehensive error logging
- Graceful render failure handling
- Resource cleanup on errors
- Status code management

This architecture provides a robust foundation for AI UGC video creation while maintaining scalability and user experience. 