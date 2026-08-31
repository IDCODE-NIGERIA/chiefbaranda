import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../lib/generated/prisma/client';
import { seedCars } from '../lib/seedCars';
import { preOrderSlots } from '../lib/carData';

/**
 * Seeds the starter catalogue. Idempotent — re-running updates the fixtures
 * in place rather than duplicating them, so it is safe to run after a pull.
 */
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  for (const car of seedCars) {
    const { slug, ...rest } = car;
    await prisma.car.upsert({
      where: { slug },
      update: rest,
      create: { slug, ...rest },
    });
  }
  console.log(`Seeded ${seedCars.length} cars`);

  for (const slot of preOrderSlots) {
    const { id, ...rest } = slot;
    await prisma.preOrderSlot.upsert({
      where: { id },
      // Don't reset `remaining` on re-seed — reservations already taken must
      // not reappear as available stock.
      update: { ...rest, remaining: undefined },
      create: { id, ...rest, active: true },
    });
  }
  console.log(`Seeded ${preOrderSlots.length} pre-order slots`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
