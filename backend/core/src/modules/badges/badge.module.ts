// src/modules/badges/badge.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge, UserBadge } from '@transcendence/db-entities';
import { BadgeBootstrapService } from './badge.seed';
import { BadgeService } from './badge.service';
import { BadgeController } from './badge.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Badge, UserBadge])],
  controllers: [BadgeController],
  providers: [BadgeBootstrapService, BadgeService],
  exports: [BadgeService],
})
export class BadgeModule {}