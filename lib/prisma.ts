import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/lib/generated/prisma/client';

/**
 * Prisma client singleton.
 *
 * Prisma 7 talks to Postgres through a driver adapter rather than its own
 * engine binary. Next dev reloads modules on every edit, so without caching
 * on `globalThis` each reload would open a new pool and exhaust the
 * database's connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

/**
 * Created lazily so that importing this module without `DATABASE_URL` (the
 * static-catalogue fallback) doesn't throw at import time.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = (globalForPrisma.prisma ??= createClient());
    return Reflect.get(client, property, client);
  },
});

/** Whether a database connection is configured at all. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
