import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../lib/generated/prisma/client';
import { hashPassword, isValidEmail, isValidPassword } from '../lib/auth';

/**
 * Create or promote an admin account.
 *
 * Sets `role: "admin"` on the user row, which grants access on its own — it
 * does not depend on ADMIN_EMAILS, so this works for any address without
 * touching environment variables or redeploying.
 *
 *   npm run make:admin -- <email> <password> [firstName] [lastName] [phone]
 */
async function main() {
  const [email, password, firstName = 'Admin', lastName = 'User', phone = '08000000000'] =
    process.argv.slice(2);

  if (!email || !password) {
    console.error('Usage: npm run make:admin -- <email> <password> [firstName] [lastName] [phone]');
    process.exit(1);
  }

  if (!isValidEmail(email)) {
    console.error(`"${email}" is not a valid email address.`);
    process.exit(1);
  }

  const strength = isValidPassword(password);
  if (!strength.valid) {
    console.error(`Password rejected: ${strength.message}`);
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set. Check your .env file.');
    process.exit(1);
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const normalised = email.trim().toLowerCase();
  const hashed = await hashPassword(password);

  const existing = await prisma.user.findUnique({ where: { email: normalised } });

  if (existing) {
    await prisma.user.update({
      where: { email: normalised },
      data: { role: 'admin', password: hashed },
    });
    console.log(`Updated ${normalised}: now an admin, password reset.`);
  } else {
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: normalised,
        phone,
        password: hashed,
        userType: 'buyer',
        role: 'admin',
        verified: true,
      },
    });
    console.log(`Created admin account for ${normalised}.`);
  }

  console.log('Sign in at /signin, then open /admin.');
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
