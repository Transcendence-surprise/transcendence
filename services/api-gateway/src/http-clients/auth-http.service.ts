import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AxiosError } from 'axios';

import { LoginUserDto } from '../interfaces/auth/dto/login-user.dto';
import { SignupUserDto } from '../interfaces/auth/dto/signup-user.dto';

import { AuthLoginResponse } from '../interfaces/auth/service-auth-login-response';
import { AuthSignupResponse } from '../interfaces/auth/service-auth-signup-response';

@Injectable()
export class AuthHttpService {
  constructor(private readonly http: HttpService) {}

  async login(body: LoginUserDto): Promise<AuthLoginResponse> {
    const obs = this.http.post('/api/auth/login', body).pipe(
      retry(1),
      catchError((err: AxiosError) => {
        throw err;
      }),
    );
    const res = await lastValueFrom(obs);
    return res.data as AuthLoginResponse;
  }

  async signup(body: SignupUserDto): Promise<AuthSignupResponse> {
    const obs = this.http.post('/api/auth/signup', body).pipe(
      retry(1),
      catchError((err: AxiosError) => {
        throw err;
      }),
    );
    const res = await lastValueFrom(obs);
    return res.data as AuthSignupResponse;
  }
}
