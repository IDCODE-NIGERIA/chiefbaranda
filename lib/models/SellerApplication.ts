import type { SellerApplicationModel, StockAlertModel } from '@/lib/generated/prisma/models';

export type SellerApplicationStatus = 'pending' | 'approved' | 'rejected';

/** A seller application row with `status` narrowed to its real union. */
export type SellerApplication = Omit<SellerApplicationModel, 'status'> & {
  status: SellerApplicationStatus;
};

/** "Notify me when this lands" request from the Coming Soon rail. */
export type StockAlert = StockAlertModel;
