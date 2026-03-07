import { NextRequest, NextResponse } from 'next/server';
import { trackVisitor, getVisitorStats } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const { page, sessionId } = await req.json();
    trackVisitor({
      id: sessionId || Math.random().toString(36).slice(2),
      page: page || '/',
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent') || undefined,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json(getVisitorStats());
}
