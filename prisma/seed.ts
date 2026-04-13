import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

/**
 * Seed script — creates the demo user test123 / pass123
 * Also seeds a 16-day streak and 2 badges (one-week + half-month).
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

  // yesterday UTC — so streak shows as active (last practiced yesterday = still ongoing)
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(10, 0, 0, 0); // 10am UTC yesterday

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash,
      // set streak data for the test user
      currentStreak: 16,
      longestStreak: 16,
      lastPracticeDate: yesterday,
      totalPracticeDays: 16,
    },
    create: {
      username,
      passwordHash,
      displayName: 'Test User',
      childName: 'Demo Child',
      grade: '5',
      onboardingCompletedAt: new Date(),
      currentStreak: 16,
      longestStreak: 16,
      lastPracticeDate: yesterday,
      totalPracticeDays: 16,
    },
  });

  console.log(`\u2705 Seeded user: ${user.username} (id: ${user.id})`);
  console.log(`   username: ${username}`);
  console.log(`   password: ${password}`);
  console.log(`   streak:   ${user.currentStreak} days`);

  // seed badges — streak-7 (One Week Strong) and streak-15 (Half-Month Hero)
  const badges = [
    {
      slug: 'streak-7',
      title: 'One Week Strong',
      emoji: '\u2b50',
      description: 'A full week of practice \u2014 impressive!',
      // awarded 9 days ago (when they hit day 7)
      unlockedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    },
    {
      slug: 'streak-15',
      title: 'Half-Month Hero',
      emoji: '\ud83c\udfc5',
      description: "15 days! You're in the top learners now.",
      // awarded yesterday (when they hit day 15... well, 16 now)
      unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ] as const;

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { userId_slug: { userId: user.id, slug: badge.slug } },
      update: {}, // dont overwrite if already there
      create: {
        userId: user.id,
        slug: badge.slug,
        title: badge.title,
        emoji: badge.emoji,
        description: badge.description,
        unlockedAt: badge.unlockedAt,
      },
    });
    console.log(`   \ud83c\udf96\ufe0f  Badge seeded: ${badge.emoji} ${badge.title}`);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
