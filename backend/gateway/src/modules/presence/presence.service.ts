// src/modules/presence/presence.http.service.ts

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PresenceHTTPService {
  constructor(private readonly http: HttpService) {}

  private readonly internalKey = process.env.INTERNAL_SERVICE_KEY;

  private async request<T>(
    method: 'get' | 'post',
    path: string,
    data?: unknown,
  ): Promise<T> {
    const res = await lastValueFrom(
      this.http.request<T>({
        method,
        url: path,
        data,
        headers: {
          'x-internal-key': this.internalKey,
        },
      }),
    );

    return res.data;
  }

  // ----------------------------
  // API to CORE microservice
  // ----------------------------

  async markOnline(userId: number) {
    return this.request('post', '/api/presence/online', { userId });
  }

  async markOffline(userId: number) {
    return this.request('post', '/api/presence/offline', { userId });
  }

  async getStatuses(userIds: number[]) {
    return this.request<{ userId: number; isOnline: boolean }[]>(
      'post',
      '/api/presence/statuses',
      { userIds },
    );
  }
}
