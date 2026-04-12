import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon serverless — generous timeouts to survive cold starts
    max: 3,
    idleTimeoutMillis: 60_000,
    connectionTimeoutMillis: 15_000,
  });

  // handle pool errors gracefully (Neon can drop connections during scale-to-zero)
  pool.on('error', (err) => {
    console.warn('[prisma/pool] Idle client error (non-fatal):', err.message);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    transactionOptions: {
      maxWait: 15_000,  // up to 15s to acquire a connection
      timeout: 60_000,  // up to 60s for transaction (AI generation can be slow)
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
