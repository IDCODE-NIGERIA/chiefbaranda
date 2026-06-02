
import { successResponse, clearAuthCookie } from '@/lib/api-utils';

export async function POST() {
  const response = successResponse({ message: 'Logged out successfully' });
  clearAuthCookie(response);
  return response;
}
