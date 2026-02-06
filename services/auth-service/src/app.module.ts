import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import authConfig from './config/auth.config';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
    }),
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
    AuthModule
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
