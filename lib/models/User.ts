import type { UserModel } from '@/lib/generated/prisma/models';

export type UserType = 'buyer' | 'seller';
export type Role = 'user' | 'admin';

/** A user row with the text columns narrowed to their real unions. */
export type User = Omit<UserModel, 'userType' | 'role'> & {
  userType: UserType;
  role: Role;
};

export type UserPublic = Omit<User, 'password'>;
