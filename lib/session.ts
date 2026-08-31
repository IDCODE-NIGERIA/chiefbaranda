import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { isAdminEmail } from '@/lib/config';
import type { User, UserPublic } from '@/lib/models/User';

/**
 * Server-side session helpers for route handlers and server components.
 *
 * `proxy.ts` only does an optimistic cookie check; anything that reads or
 * writes data must call these, which verify the JWT and load the user.
 */

export interface SessionUser extends UserPublic {
  isAdmin: boolean;
}

function tokenFrom(request: NextRequest | Request): string | null {
  if ('cookies' in request && typeof request.cookies?.get === 'function') {
    return (request as NextRequest).cookies.get('auth')?.value ?? null;
  }

  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  return (
    cookieHeader
      .split(';')
      .find((c) => c.trim().startsWith('auth='))
      ?.split('=')
      .slice(1)
      .join('=') || null
  );
}

/** Load and shape a user from a verified token payload. */
async function loadUser(userId: string): Promise<SessionUser | null> {
  if (!isDatabaseConfigured()) return null;

  const user = (await prisma.user.findUnique({ where: { id: userId } })) as User | null;
  if (!user) return null;

  const { password: _password, ...rest } = user;
  void _password;

  return {
    ...rest,
    isAdmin: user.role === 'admin' || isAdminEmail(user.email),
  };
}

/** Returns the signed-in user, or null. Never throws on a bad token. */
export async function getSessionUser(
  request: NextRequest | Request
): Promise<SessionUser | null> {
  const token = tokenFrom(request);
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return loadUser(decoded.userId);
}

/** Same, but only resolves for admins. */
export async function getAdminUser(
  request: NextRequest | Request
): Promise<SessionUser | null> {
  const user = await getSessionUser(request);
  return user?.isAdmin ? user : null;
}

/**
 * Session for server components and pages, which have no request object.
 * `cookies()` is async in Next 16.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get('auth')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return loadUser(decoded.userId);
}
