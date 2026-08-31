import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import ProfileEditor from '@/components/ProfileEditor';

export const metadata: Metadata = {
  title: 'My profile · ChiefBaranda',
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/signin?redirect=/profile');

  const orderCount = await prisma.order.count({
    where: { OR: [{ userId: user.id }, { buyerEmail: user.email.toLowerCase() }] },
  });

  // Rendered from the server-loaded user so the page has content on first
  // paint; the editor then tracks AuthContext so edits show up instantly in
  // the header too.
  return (
    <ProfileEditor
      orderCount={orderCount}
      initialUser={{
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
      }}
    />
  );
}
