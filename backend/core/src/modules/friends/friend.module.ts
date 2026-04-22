// src/modules/friends/friend.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from '@transcendence/db-entities';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Friendship])],
  controllers: [FriendController],
  providers: [FriendService],
  exports: [FriendService],
})
export class FriendModule {}