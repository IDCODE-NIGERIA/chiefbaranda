import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../lib/generated/prisma/client';
import { hashPassword } from '../lib/auth';
import { quoteOrder } from '../lib/config';

/**
 * Populate the dashboard with realistic sample activity so it can be looked
 * at properly. Everything created here is tagged DEMO in the description or
 * uses @demo.chiefbaranda.ng addresses, so `npm run demo:clear` can remove it
 * without touching real data.
 *
 *   npm run demo:seed    -- create sample buyers, orders and alerts
 *   npm run demo:clear   -- remove all of it
 */

const DEMO_DOMAIN = '@demo.chiefbaranda.ng';

async function client() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

async function seed() {
  const prisma = await client();
  const password = await hashPassword('DemoBuyer2026');

  const buyers = [
    { firstName: 'Chioma', lastName: 'Okeke', city: 'Lagos', state: 'Lagos', phone: '08031112222' },
    { firstName: 'Musa', lastName: 'Ibrahim', city: 'Abuja', state: 'FCT Abuja', phone: '08033334444' },
    { firstName: 'Tunde', lastName: 'Bakare', city: 'Ibadan', state: 'Oyo', phone: '08035556666' },
  ];

  const created = [];
  for (const b of buyers) {
    const email = `${b.firstName.toLowerCase()}${DEMO_DOMAIN}`;
    created.push(
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          ...b,
          email,
          password,
          userType: 'buyer',
          verified: true,
          address: `${10 + created.length} Marina Road`,
        },
      })
    );
  }

  const cars = await prisma.car.findMany({ take: 3, orderBy: { price: 'desc' } });
  const slots = await prisma.preOrderSlot.findMany({ take: 2 });

  // A spread of statuses so the pipeline and money figures look real.
  const plan = [
    { kind: 'buy' as const, status: 'paid', idx: 0, buyer: 0 },
    { kind: 'buy' as const, status: 'pending', idx: 1, buyer: 1 },
    { kind: 'pre-order' as const, status: 'in-transit', idx: 0, buyer: 2 },
    { kind: 'pre-order' as const, status: 'completed', idx: 1, buyer: 0 },
  ];

  let n = 0;
  for (const p of plan) {
    const listing = p.kind === 'buy' ? cars[p.idx] : slots[p.idx];
    if (!listing) continue;

    const price = p.kind === 'buy' ? (listing as { price: number }).price : (listing as { fromPrice: number }).fromPrice;
    const title = listing.title;
    const image = p.kind === 'buy' ? (listing as { images: string[] }).images[0] : (listing as { image: string }).image;
    const listingId = p.kind === 'buy' ? (listing as { slug: string }).slug : (listing as { id: string }).id;

    const quote = quoteOrder({ price, kind: p.kind, plan: 'deposit' });
    const buyer = created[p.buyer];
    const reference = `CB-DEMO${++n}`;

    await prisma.order.upsert({
      where: { reference },
      update: {},
      create: {
        reference,
        userId: buyer.id,
        buyerName: `${buyer.firstName} ${buyer.lastName}`,
        buyerEmail: buyer.email,
        buyerPhone: buyer.phone,
        buyerAddress: buyer.address ?? '10 Marina Road',
        buyerCity: buyer.city ?? 'Lagos',
        buyerState: buyer.state ?? 'Lagos',
        kind: p.kind,
        listingId,
        listingTitle: title,
        listingImage: image,
        plan: 'deposit',
        price: quote.price,
        amountDueNow: quote.amountDueNow,
        balance: quote.balance,
        financeFee: 0,
        monthlyInstalment: 0,
        status: p.status,
        paystackReference: reference,
        paidAt: p.status === 'pending' ? null : new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        audience: 'admin',
        kind: p.status === 'pending' ? 'payment-request' : 'payment-received',
        title:
          p.status === 'pending'
            ? `Payment request — ${title}`
            : `Payment received — ${reference}`,
        body: `${buyer.firstName} ${buyer.lastName} (${buyer.phone}) — ₦${quote.amountDueNow.toLocaleString('en-NG')} on ${title}.`,
        // Tagged so `demo:clear` can find these regardless of their wording.
        href: '/admin?demo=1',
        read: false,
        smsSent: false,
        smsError: 'No admin phone configured',
      },
    });
  }

  await prisma.sellerApplication.upsert({
    where: { id: 'demo-application-1' },
    update: {},
    create: {
      id: 'demo-application-1',
      firstName: 'Emeka',
      lastName: 'Nwosu',
      email: `emeka${DEMO_DOMAIN}`,
      phone: '08037778888',
      shopName: 'Emeka Autos',
      shopAddress: '45 Awolowo Road, Ikoyi',
      city: 'Lagos',
      state: 'Lagos',
      businessType: 'Dealership',
      carsPerMonth: '10-20',
      about: 'Ten years importing tokunbo cars from the US and Canada.',
      status: 'pending',
    },
  });

  for (const slot of slots) {
    await prisma.stockAlert.upsert({
      where: { email_listingId: { email: `chioma${DEMO_DOMAIN}`, listingId: slot.id } },
      update: {},
      create: {
        email: `chioma${DEMO_DOMAIN}`,
        phone: '08031112222',
        listingId: slot.id,
        listingTitle: slot.title,
        notified: false,
      },
    });
  }

  console.log('Demo data created: 3 buyers, 4 orders, notifications, 1 seller application, stock alerts.');
  console.log('Remove it later with: npm run demo:clear');
  await prisma.$disconnect();
}

async function clear() {
  const prisma = await client();

  await prisma.notification.deleteMany({ where: { href: '/admin?demo=1' } });
  await prisma.notification.deleteMany({ where: { body: { contains: DEMO_DOMAIN } } });
  await prisma.order.deleteMany({ where: { reference: { startsWith: 'CB-DEMO' } } });
  await prisma.stockAlert.deleteMany({ where: { email: { endsWith: DEMO_DOMAIN } } });
  await prisma.sellerApplication.deleteMany({ where: { email: { endsWith: DEMO_DOMAIN } } });
  await prisma.savedCar.deleteMany({ where: { user: { email: { endsWith: DEMO_DOMAIN } } } });
  await prisma.user.deleteMany({ where: { email: { endsWith: DEMO_DOMAIN } } });
  // Notifications raised against demo orders have no email in the body.
  await prisma.notification.deleteMany({ where: { title: { contains: 'CB-DEMO' } } });

  console.log('Demo data removed. Real accounts and listings are untouched.');
  await prisma.$disconnect();
}

/**
 * Remove the fixture catalogue — the 8 seeded cars and the pre-order slots
 * from `carData.ts`. Run this before going live so the only listings on the
 * site are ones actually added through /admin.
 *
 * Refuses to touch a car that has an order against it.
 */
async function clearCatalogue() {
  const prisma = await client();

  const ordered = await prisma.order.findMany({
    where: { kind: 'buy' },
    select: { listingId: true },
  });
  const protectedSlugs = ordered.map((o) => o.listingId);

  const cars = await prisma.car.deleteMany({
    where: { slug: { notIn: protectedSlugs.length ? protectedSlugs : ['__none__'] } },
  });

  const orderedSlots = await prisma.order.findMany({
    where: { kind: 'pre-order' },
    select: { listingId: true },
  });
  const protectedSlots = orderedSlots.map((o) => o.listingId);

  const slots = await prisma.preOrderSlot.deleteMany({
    where: { id: { notIn: protectedSlots.length ? protectedSlots : ['__none__'] } },
  });

  console.log(`Removed ${cars.count} cars and ${slots.count} pre-order slots.`);
  if (protectedSlugs.length || protectedSlots.length) {
    console.log(
      `Kept ${protectedSlugs.length + protectedSlots.length} listing(s) that have orders against them.`
    );
  }
  console.log('Add your real stock at /admin → Inventory → Add a car.');
  await prisma.$disconnect();
}

const command = process.argv[2];
const run =
  command === 'clear' ? clear : command === 'clear-catalogue' ? clearCatalogue : seed;

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
