import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { getCurrentUser } from '@/lib/session';
import AdminDashboard from '@/components/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin · ChiefBaranda',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) redirect('/signin?redirect=/admin');

  if (!user.isAdmin) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">Not your floor</h1>
          <p className="text-neutral-600 leading-relaxed">
            This dashboard is for ChiefBaranda staff. If you should have access,
            ask an administrator to add your email to the admin list.
          </p>
        </div>
      </div>
    );
  }

  return <AdminDashboard adminName={user.firstName} />;
}
