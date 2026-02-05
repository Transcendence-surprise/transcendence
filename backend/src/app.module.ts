import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';
import { UsersModule } from './users/users.module';

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
      synchronize: false, // DB bootstrapped by init SQL
    }),
    UsersModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
