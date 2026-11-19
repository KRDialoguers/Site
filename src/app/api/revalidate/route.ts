import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

// Sanity calls this webhook on publish (see README → "Publish = live").
// Content is cached under one tag, so any change refreshes the whole site within seconds.
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature } = await parseBody(req, process.env.SANITY_REVALIDATE_SECRET);
    if (!isValidSignature) return new NextResponse('Invalid signature', { status: 401 });
    revalidateTag('content', 'max');
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return new NextResponse((err as Error).message, { status: 500 });
  }
}
