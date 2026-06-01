import { ObjectId } from 'mongodb';

export interface Car {
  _id?: ObjectId;
  title: string;
  type: 'sedan' | 'suv' | 'truck' | 'coupe' | 'hatchback' | 'van' | string;
  price: number;
  sellerId: ObjectId | string;
  sellerName: string;
  sellerVerified: boolean;
  description: string;
  images: string[]; // URLs or base64
  preOrder: boolean;
  expectedDelivery?: Date; // for pre-orders
  mileage?: number;
  year?: number;
  color?: string;
  transmission?: 'manual' | 'automatic';
  fuel?: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
