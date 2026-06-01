import { NextResponse } from 'next/server';

/**
 * API Response types
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

/**
 * Success response handler
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    { success: true, data, message },
    { status }
  );
}

/**
 * Error response handler
 */
export function errorResponse(
  error: string,
  code: string = 'ERROR',
  status: number = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error, code },
    { status }
  );
}

/**
 * Validation error response
 */
export function validationError(errors: Record<string, string>, status: number = 400) {
  return NextResponse.json(
    { success: false, error: 'Validation failed', code: 'VALIDATION_ERROR', errors },
    { status }
  );
}

/**
 * Unauthorized response
 */
export function unauthorized(message: string = 'Unauthorized') {
  return errorResponse(message, 'UNAUTHORIZED', 401);
}

/**
 * Not found response
 */
export function notFound(message: string = 'Not found') {
  return errorResponse(message, 'NOT_FOUND', 404);
}

/**
 * Extract JWT from cookies
 */
export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const token = cookieHeader
    .split(';')
    .find(c => c.trim().startsWith('auth='))
    ?.split('=')[1];

  return token || null;
}

/**
 * Set auth cookie in response
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set('auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });
}

/**
 * Clear auth cookie in response
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set('auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
