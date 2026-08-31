import { NextRequest } from 'next/server';

import { getSessionUser } from '@/lib/session';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return errorResponse('Not authenticated', 'NOT_AUTHENTICATED', 401);
    }

    // Return user data without password
    return successResponse({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      avatar: user.avatar,
      verified: user.verified,
      isAdmin: user.isAdmin,
      address: user.address,
      city: user.city,
      state: user.state,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
