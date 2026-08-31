import { prisma } from '@/lib/prisma';

/**
 * Serve an uploaded image.
 *
 * Public by design — these are listing photos. Images are immutable once
 * uploaded (a replacement gets a new id), so they cache forever.
 */
export async function GET(_request: Request, ctx: RouteContext<'/api/images/[id]'>) {
  try {
    const { id } = await ctx.params;

    const image = await prisma.image.findUnique({
      where: { id },
      select: { data: true, mimeType: true },
    });

    if (!image) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(new Uint8Array(image.data), {
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Serve image error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
