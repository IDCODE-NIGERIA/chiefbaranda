import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { hashPassword, isValidEmail, isValidPassword, isValidPhone, signToken } from '@/lib/auth';
import { successResponse, validationError, errorResponse, setAuthCookie } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password, confirmPassword, userType, termsAccepted } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (!firstName?.trim()) errors.firstName = 'First name is required';
    if (!lastName?.trim()) errors.lastName = 'Last name is required';
    if (!email?.trim()) errors.email = 'Email is required';
    else if (!isValidEmail(email)) errors.email = 'Invalid email format';

    if (!phone?.trim()) errors.phone = 'Phone is required';
    else if (!isValidPhone(phone)) errors.phone = 'Invalid phone number';

    if (!password) errors.password = 'Password is required';
    else {
      const pwdValidation = isValidPassword(password);
      if (!pwdValidation.valid) errors.password = pwdValidation.message!;
    }

    if (!confirmPassword) errors.confirmPassword = 'Please confirm password';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (!userType || !['buyer', 'seller'].includes(userType)) errors.userType = 'Please select user type';
    if (!termsAccepted) errors.termsAccepted = 'You must accept terms and conditions';

    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    // Check if user exists
    const normalisedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: normalisedEmail } });

    if (existingUser) {
      return errorResponse('User with this email already exists', 'EMAIL_EXISTS', 409);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalisedEmail,
        phone: phone.trim(),
        password: hashedPassword,
        userType,
        verified: false,
      },
    });

    // Create JWT token
    const token = signToken(newUser.id, newUser.email);

    // Same shape as /signin and /me — the client stores all three responses
    // into the same user state, so they must not drift apart.
    const response = successResponse(
      {
        userId: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        userType: newUser.userType,
        avatar: newUser.avatar,
        verified: newUser.verified,
      },
      'Signup successful',
      201
    );

    // Set auth cookie
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
