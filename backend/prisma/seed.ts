// Database seed. Provisions the single ADMIN account — admins are created ONLY
// here, never through public sign-up. Run with `npm run prisma:seed`
// (or automatically after `prisma migrate dev` / `prisma migrate reset`).
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.js';

const SALT_ROUNDS = 12;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaMariaDb(connectionString),
  });

  const email = process.env.ADMIN_EMAIL ?? 'admin@cgpa.local';
  const password = process.env.ADMIN_PASSWORD ?? 'admin12345';

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const admin = await prisma.user.upsert({
      where: { email },
      // Keep the role ADMIN on re-seed; refresh the password hash.
      update: { passwordHash, role: 'ADMIN' },
      create: {
        email,
        passwordHash,
        fullName: 'Administrator',
        role: 'ADMIN',
      },
    });
    console.log(`✅ Seeded ADMIN user: ${admin.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
