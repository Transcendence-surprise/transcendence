import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@transcendence/db-entities';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ImagesModule } from '../images/images.module';
import { BadgeModule } from '../badges/badge.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ImagesModule, BadgeModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
