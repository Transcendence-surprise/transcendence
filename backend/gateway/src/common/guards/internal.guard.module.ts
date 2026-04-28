// src/guards/guard.module.ts

import { Module } from '@nestjs/common';
import { InternalGuard } from './internal.guard';

@Module({
  providers: [InternalGuard],
  exports: [InternalGuard],
})
export class GuardModule {}