# Music Assets Directory

This directory should contain preset background music files for the AI UGC Studio.

## Required Files

You need to add the following 4 preset music files to this directory:

1. **upbeat-pop.mp3** - An upbeat, energetic track suitable for promotional content
2. **chill-vibes.mp3** - A relaxed, ambient track for calm content
3. **electronic.mp3** - A modern electronic track for tech/digital content
4. **cinematic.mp3** - A dramatic, cinematic track for storytelling content

## File Requirements

- **Format**: MP3 (preferred) or WAV
- **Duration**: 60-120 seconds (will be looped if needed)
- **Bitrate**: 128kbps or higher for good quality
- **Sample Rate**: 44.1kHz standard
- **File Size**: Keep under 10MB per file for fast loading

## Usage

These files are referenced in `/src/components/remotion/musicselector.tsx`:

```typescript
const presetMusic = [
  { id: 'upbeat', name: 'Upbeat Pop', url: '/music/upbeat-pop.mp3' },
  { id: 'chill', name: 'Chill Vibes', url: '/music/chill-vibes.mp3' },
  { id: 'electronic', name: 'Electronic', url: '/music/electronic.mp3' },
  { id: 'cinematic', name: 'Cinematic', url: '/music/cinematic.mp3' },
];
```

## Copyright Notice

Ensure all music files are:
- Royalty-free or properly licensed
- Cleared for commercial use if applicable
- Properly attributed if required

## Sources for Music

### Free Options
- **Freesound.org** - Community-driven sound library
- **Pixabay Music** - Free music for commercial use
- **Unsplash Audio** - Free audio tracks
- **YouTube Audio Library** - Free music from YouTube

### Paid Options
- **Epidemic Sound** - Professional music library
- **AudioJungle** - Envato's music marketplace
- **Pond5** - Stock music and sound effects
- **Shutterstock Music** - Licensed background music

## Next Steps

1. Source or create the 4 required music files
2. Place them in this directory with the exact filenames listed above
3. Test the music selector to ensure files load correctly
4. Update preset options if you want to add more tracks