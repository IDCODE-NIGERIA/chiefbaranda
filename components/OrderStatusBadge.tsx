import type { OrderStatus } from '@/lib/models/Order';

const styles: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Awaiting payment', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  paid: { label: 'Deposit paid', className: 'bg-green-50 text-green-800 border-green-200' },
  failed: { label: 'Payment failed', className: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  'in-transit': { label: 'In transit', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  ready: { label: 'Ready for inspection', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  completed: { label: 'Completed', className: 'bg-green-50 text-green-800 border-green-200' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const style = styles[status] ?? styles.pending;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export const orderStatusLabel = (status: OrderStatus): string =>
  (styles[status] ?? styles.pending).label;
