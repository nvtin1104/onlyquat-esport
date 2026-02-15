import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'libs/common/prisma/schema.prisma',
  migrations: {
    path: 'libs/common/prisma/migrations',
    seed: 'npx tsx libs/common/prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
