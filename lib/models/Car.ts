import type { CarModel, PreOrderSlotModel } from '@/lib/generated/prisma/models';

import type { Condition } from '@/lib/carData';

export type CarStatus = 'available' | 'reserved' | 'sold';
export type Transmission = 'manual' | 'automatic';
export type Fuel = 'petrol' | 'diesel' | 'hybrid' | 'electric';

/** A car row with the text columns narrowed to their real unions. */
export type Car = Omit<CarModel, 'condition' | 'status' | 'transmission' | 'fuel'> & {
  condition: Condition;
  status: CarStatus;
  transmission: Transmission | null;
  fuel: Fuel | null;
};

/** A pre-order slot row, likewise narrowed. */
export type PreOrderSlotRow = Omit<PreOrderSlotModel, 'condition'> & {
  condition: Condition;
};
