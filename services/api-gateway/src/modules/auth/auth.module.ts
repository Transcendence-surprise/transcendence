import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthHttpService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from '../../common/guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001',
      timeout: 5000,
      maxRedirects: 5,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthHttpService, AuthGuard],
  exports: [AuthHttpService, AuthGuard, JwtModule],
})
export class AuthHttpModule {}
