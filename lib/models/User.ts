import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string; // hashed
  userType: 'buyer' | 'seller';
  avatar?: string; // base64 or URL
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPublic = Omit<User, 'password'>;
