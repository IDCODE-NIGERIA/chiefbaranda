import type { NotificationModel } from '@/lib/generated/prisma/models';

export type NotificationKind =
  | 'payment-request' // buyer started a checkout
  | 'payment-received' // Paystack confirmed a charge
  | 'payment-failed'
  | 'seller-application'
  | 'stock-alert'; // someone asked to be told when a car lands

export type NotificationAudience = 'admin' | 'user';

/** A notification row with the text columns narrowed to their real unions. */
export type Notification = Omit<NotificationModel, 'audience' | 'kind'> & {
  audience: NotificationAudience;
  kind: NotificationKind;
};
