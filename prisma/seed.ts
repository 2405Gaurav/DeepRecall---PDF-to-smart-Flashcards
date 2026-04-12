import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

/**
 * Seed script — creates the demo user test123 / pass123
 * Run with: npx tsx prisma/seed.ts
 */

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2,
    connectionTimeoutMillis: 15_000,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const username = 'test123';
  const password = 'pass123';

  // hash the password with bcrypt cost 12
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: {
      username,
      passwordHash,
      displayName: 'Test User',
      childName: 'Demo Child',
      grade: '5',
      onboardingCompletedAt: new Date(),
    },
  });

  console.log(`✅ Seeded user: ${user.username} (id: ${user.id})`);
  console.log(`   username: ${username}`);
  console.log(`   password: ${password}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
