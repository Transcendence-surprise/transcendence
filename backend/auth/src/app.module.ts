import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import authConfig from './config/auth.config';
import { AuthModule } from './modules/auth/auth.module';
import { OAuthModule } from './modules/oauth/oauth.module';
import { ApiKeyModule } from './modules/api-keys/api-key.module';
import { HealthController } from './health/health.controller';
import { loadVaultSecrets } from './vault';

@Module({})
class VaultConfigModule {
  static async forRootAsync(): Promise<DynamicModule> {
    await loadVaultSecrets();

    return {
      module: VaultConfigModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [authConfig],
        }),
      ],
      exports: [ConfigModule],
    };
  }
}

@Module({
  imports: [
    VaultConfigModule.forRootAsync(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [authConfig.KEY],
      useFactory: (config: ConfigType<typeof authConfig>) => ({
        type: 'postgres',
        host: config.db.host,
        port: Number(config.db.port),
        username: config.db.username,
        password: config.db.password,
        database: config.db.databse,
        autoLoadEntities: config.db.autoLoadEntities,
        synchronize: config.db.synchonize,
      }),
    }),
    AuthModule,
    OAuthModule,
    ApiKeyModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
