import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';
import { UsersModule } from './users/users.module';
import { GameModule } from './game/modules/game.module'; // My GAME
import { WsModule } from './ws/ws.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      username: process.env.POSTGRES_USER ?? 'transcendence',
      password: process.env.POSTGRES_PASSWORD ?? 'transcendence',
      database: process.env.POSTGRES_DB ?? 'transcendence',
      autoLoadEntities: true,
      synchronize: false, // keep false since we use migrations
    }),
    UsersModule,
    GameModule,
    WsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
