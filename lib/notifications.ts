import { prisma } from '@/lib/prisma';
import { smsAllAdmins } from '@/lib/sms';
import { formatNairaExact } from '@/lib/carData';
import type { Notification, NotificationKind } from '@/lib/models/Notification';
import type { Order } from '@/lib/models/Order';

/**
 * Notifications are written to the database first (so the admin dashboard is
 * the reliable record) and only then pushed out over SMS. SMS failures are
 * recorded on the notification rather than thrown.
 */

export async function createNotification(input: {
  audience: 'admin' | 'user';
  userId?: string | null;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string;
}): Promise<Notification> {
  const notification = await prisma.notification.create({
    data: {
      audience: input.audience,
      userId: input.userId ?? null,
      kind: input.kind,
      title: input.title,
      body: input.body,
      href: input.href,
      read: false,
    },
  });

  return notification as Notification;
}

async function markSmsResult(notificationId: string, sent: boolean, error?: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { smsSent: sent, smsError: error ?? null },
  });
}

/**
 * Fired when a buyer reaches checkout and a payment is requested — before the
 * money actually lands. This is the "there's a payment request" alert.
 */
export async function notifyAdminPaymentRequested(order: Order): Promise<void> {
  const notification = await createNotification({
    audience: 'admin',
    kind: 'payment-request',
    title: `Payment request — ${order.listingTitle}`,
    body: `${order.buyerName} (${order.buyerPhone}) started a ${order.kind} checkout for ${formatNairaExact(
      order.amountDueNow
    )} of ${formatNairaExact(order.price)}.`,
    href: `/admin`,
  });

  const message =
    `ChiefBaranda: New payment request ${order.reference}. ` +
    `${order.buyerName} — ${order.listingTitle}. ` +
    `${formatNairaExact(order.amountDueNow)} due now. Phone ${order.buyerPhone}.`;

  const result = await smsAllAdmins(message);
  await markSmsResult(notification.id, result.sent, result.error);
}

/** Fired once Paystack confirms the money actually moved. */
export async function notifyPaymentReceived(order: Order): Promise<void> {
  const adminNotification = await createNotification({
    audience: 'admin',
    kind: 'payment-received',
    title: `Payment received — ${order.reference}`,
    body: `${formatNairaExact(order.amountDueNow)} confirmed from ${order.buyerName} for ${
      order.listingTitle
    }. Balance ${formatNairaExact(order.balance)}.`,
    href: `/admin`,
  });

  if (order.userId) {
    await createNotification({
      audience: 'user',
      userId: order.userId,
      kind: 'payment-received',
      title: 'Payment confirmed',
      body: `We received ${formatNairaExact(order.amountDueNow)} for your ${order.listingTitle}. Order ${
        order.reference
      }.`,
      href: `/orders/${order.reference}`,
    });
  }

  const message =
    `ChiefBaranda: PAYMENT RECEIVED ${order.reference}. ` +
    `${formatNairaExact(order.amountDueNow)} from ${order.buyerName} for ${order.listingTitle}. ` +
    `Balance ${formatNairaExact(order.balance)}.`;

  const result = await smsAllAdmins(message);
  await markSmsResult(adminNotification.id, result.sent, result.error);
}

export async function notifySellerApplication(input: {
  name: string;
  shopName: string;
  phone: string;
  applicationId: string;
}): Promise<void> {
  const notification = await createNotification({
    audience: 'admin',
    kind: 'seller-application',
    title: `Seller application — ${input.shopName}`,
    body: `${input.name} (${input.phone}) applied to sell on ChiefBaranda.`,
    href: `/admin`,
  });

  const result = await smsAllAdmins(
    `ChiefBaranda: New seller application from ${input.name} (${input.shopName}). Phone ${input.phone}.`
  );
  await markSmsResult(notification.id, result.sent, result.error);
}
