import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth')?.value;

    if (!token) {
      return errorResponse('Not authenticated', 'NOT_AUTHENTICATED', 401);
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse('Invalid or expired token', 'INVALID_TOKEN', 401);
    }

    // Fetch user data
    const db = await getDatabase();
    const user = await db.collection('users').findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!user) {
      return errorResponse('User not found', 'USER_NOT_FOUND', 404);
    }

    // Return user data without password
    return successResponse({
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      avatar: user.avatar || null,
      verified: user.verified,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
