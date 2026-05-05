import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * App Role value assigned to IT Administrators in the Entra App Registration.
 * Set PMS_IT_ADMINS_ROLE in app settings / .env.local.
 * Defaults to 'ITAdmin' — must match the App Role value defined in the manifest.
 * When unset, defaults to 'ITAdmin'.
 */
const IT_ADMIN_ROLE = process.env.PMS_IT_ADMINS_ROLE || 'ITAdmin';

/** Route prefixes that require the IT Admin App Role. */
const IT_ADMIN_PREFIXES = ['/admin/settings'];

export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? origin;
  const secureCookie =
    request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';

  // ── Retrieve JWT (all protected routes) ──────────────────────────────────
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie,
  });

  // ── Not authenticated → redirect to login ────────────────────────────────
  if (!token) {
    const loginUrl = new URL('/login', appOrigin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── IT Admin role check for /admin/settings/* ─────────────────────────────
  const needsItAdmin = IT_ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (needsItAdmin) {
    const roles: string[] = (token.roles as string[] | undefined) ?? [];
    if (!roles.includes(IT_ADMIN_ROLE)) {
      return NextResponse.redirect(new URL('/unauthorized', appOrigin));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
