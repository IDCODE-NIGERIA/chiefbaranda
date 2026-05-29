import { NextRequest } from 'next/server';
import { successResponse, clearAuthCookie } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  const response = successResponse({ message: 'Logged out successfully' });
  clearAuthCookie(response);
  return response;
}
