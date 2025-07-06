import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { slideshows } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/slideshow/[id]/export
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const slideshowId = params.id;

  // Set status to 'rendering'
  await db.update(slideshows)
    .set({ status: 'rendering' })
    .where(eq(slideshows.id, slideshowId));

  // TODO: Trigger background job for actual rendering
  // For now, simulate export with a delay and fake URL
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const fakeUrl = 'https://example.com/fake-export.zip';

  // Set status to 'completed' and save renderUrl
  await db.update(slideshows)
    .set({ status: 'completed', renderUrl: fakeUrl })
    .where(eq(slideshows.id, slideshowId));

  return NextResponse.json({ success: true, renderUrl: fakeUrl });
} 