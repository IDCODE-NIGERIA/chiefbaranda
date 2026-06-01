import { ObjectId } from 'mongodb';

export interface Reservation {
  _id?: ObjectId;
  userId: ObjectId | string;
  carId: ObjectId | string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reservationDate: Date;
  estimatedDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
