import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const APEX_HOST = 'skopyr.com';
const WWW_HOST = 'www.skopyr.com';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');

  if (host === APEX_HOST) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.hostname = WWW_HOST;
    return NextResponse.redirect(redirectUrl, { status: 308 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
