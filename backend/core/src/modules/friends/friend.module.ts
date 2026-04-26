// src/modules/friends/friend.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from '@transcendence/db-entities';
import { BadgeModule } from '../badges/badge.module';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { PresenceModule } from '../presence/presence.module';

@Module({
  imports: [TypeOrmModule.forFeature([Friendship]), BadgeModule, PresenceModule],
  controllers: [FriendController],
  providers: [FriendService],
  exports: [FriendService],
})
export class FriendModule {}