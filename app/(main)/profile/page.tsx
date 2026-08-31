import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileDetails from '@/components/profile/ProfileDetails';
import ProfileExtras from '@/components/ProfileExtras';
import VerifyPhone from '@/components/VerifyPhone';

export const metadata: Metadata = {
  title: 'My profile · ChiefBaranda',
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/signin?redirect=/profile');

  const emailKey = user.email.toLowerCase();

  const [orderCount, savedCount, spend] = await Promise.all([
    prisma.order.count({ where: { OR: [{ userId: user.id }, { buyerEmail: emailKey }] } }),
    prisma.savedCar.count({ where: { userId: user.id } }),
    prisma.order.aggregate({
      where: {
        OR: [{ userId: user.id }, { buyerEmail: emailKey }],
        status: { in: ['paid', 'in-transit', 'ready', 'completed'] },
      },
      _sum: { amountDueNow: true },
    }),
  ]);

  // Serialisable shape for the client components. Rendered from the server
  // session so the page has content on first paint; AuthContext then takes
  // over so edits appear instantly in the header too.
  const initialUser = {
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    userType: user.userType,
    avatar: user.avatar,
    verified: user.verified,
    isAdmin: user.isAdmin,
    address: user.address,
    city: user.city,
    state: user.state,
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-4">
            <ProfileSidebar
              initialUser={initialUser}
              orderCount={orderCount}
              savedCount={savedCount}
              totalPaid={spend._sum.amountDueNow ?? 0}
              memberSince={new Date(user.createdAt).toLocaleDateString('en-NG', {
                month: 'long',
                year: 'numeric',
              })}
            />
          </aside>

          <main className="lg:col-span-8 space-y-5">
            <ProfileDetails initialUser={initialUser} />

            <VerifyPhone phone={user.phone} verified={Boolean(user.phoneVerifiedAt)} />

            <ProfileExtras userId={user.id} email={user.email} />
          </main>
        </div>
      </div>
    </div>
  );
}
