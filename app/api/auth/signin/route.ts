import { NextRequest } from 'next/server';

import { getDatabase } from '@/lib/mongodb';
import { verifyPassword, signToken, isValidEmail } from '@/lib/auth';
import { successResponse, validationError, errorResponse, setAuthCookie } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (!email?.trim()) errors.email = 'Email is required';
    else if (!isValidEmail(email)) errors.email = 'Invalid email format';

    if (!password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    // Find user
    const db = await getDatabase();
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user) {
      return errorResponse('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    // Create JWT token
    const token = signToken(user._id.toString(), email.toLowerCase());

    // Create response
    const response = successResponse(
      {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        avatar: user.avatar || null,
        verified: user.verified,
      },
      'Sign in successful'
    );

    // Set auth cookie
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
