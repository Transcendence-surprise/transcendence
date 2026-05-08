import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';
import { GameModule } from './game/modules/game.module'; // My GAME
import { ConfigModule } from '@nestjs/config';
import gameConfig from './config/game.config';
import { loadVaultSecrets } from './vault';

@Module({})
class VaultBootstrapModule {
  static async forRootAsync(): Promise<DynamicModule> {
    await loadVaultSecrets();

    return {
      module: VaultBootstrapModule,
    };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [gameConfig],
    }),
    VaultBootstrapModule.forRootAsync(),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
          type: 'postgres',
          host: process.env.POSTGRES_HOST ?? 'localhost',
          port: Number(process.env.POSTGRES_PORT ?? 5432),
          username: process.env.POSTGRES_USER ?? 'transcendence',
          password: process.env.POSTGRES_PASSWORD ?? 'transcendence',
          database: process.env.POSTGRES_DB ?? 'transcendence',
          autoLoadEntities: true,
          synchronize: false,
      }),
    }),
    GameModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
