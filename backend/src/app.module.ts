import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WsGateway } from './ws/ws.gateway';
import { HealthController } from './health/health.controller';
import { UsersModule } from './users/users.module';
import { GameModule } from './ game/game.module'; // My GAME
import { AuthModule } from './auth/auth.module';

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
    AuthModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, WsGateway],
})
export class AppModule {}