import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
let PrismaClientBase: any;
try {
  PrismaClientBase = require('../../generated/prisma').PrismaClient;
} catch {
  // Prisma client not generated yet - provide stub
  PrismaClientBase = class {};
}

@Injectable()
export class PrismaService
  extends PrismaClientBase
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    if (typeof this.$connect === 'function') {
      await this.$connect();
    }
  }

  async onModuleDestroy() {
    if (typeof this.$disconnect === 'function') {
      await this.$disconnect();
    }
  }
}
