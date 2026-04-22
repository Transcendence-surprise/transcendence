import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';
import { UsersModule } from './modules/users/users.module';
import { MailModule } from './modules/mail/mail.module';
import { ImagesModule } from './modules/images/images.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { MatchesModule } from './modules/matches/matches.module';
import { BadgeModule } from './modules/badges/badge.module';
import { FriendModule } from './modules/friends/friend.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      username: process.env.POSTGRES_USER ?? 'transcendence',
      password: process.env.POSTGRES_PASSWORD ?? 'transcendence',
      database: process.env.POSTGRES_DB ?? 'transcendence',
      autoLoadEntities: true,
      synchronize: false,
    }),
    UsersModule,
    MailModule,
    ImagesModule,
    LeaderboardModule,
    MatchesModule,
    BadgeModule,
    FriendModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
