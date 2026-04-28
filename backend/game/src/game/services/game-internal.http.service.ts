import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import type { ConfigType } from '@nestjs/config';
import gameConfig from '../../config/game.config';
import { Inject } from '@nestjs/common';

@Injectable()
export class GameInternalHTTPService {
  private readonly logger = new Logger(GameInternalHTTPService.name);

  constructor(
    private readonly http: HttpService,
    @Inject(gameConfig.KEY)
    private readonly config: ConfigType<typeof gameConfig>,
  ) {}

  private async request<T>(
    method: 'get' | 'post',
    path: string,
    data?: unknown,
  ): Promise<T | null> {
    try {
      const baseUrl = this.config.gateway.baseUrl.replace(/\/$/, '');
      const normalizedPath = path.startsWith('/api')
        ? path
        : `/api${path.startsWith('/') ? path : `/${path}`}`;

      const res = await lastValueFrom(
        this.http.request<T>({
          method,
          url: `${baseUrl}${normalizedPath}`,
          data,
          headers: {
            'x-internal-key': this.config.internal.serviceKey,
          },
        }),
      );

      return res.data;
    } catch (err: any) {
      this.logger.error(`Gateway request failed: ${err.message}`);
      return null;
    }
  }

  async emitGameUpdated(gameId: string) {
    return this.request('post', '/internal/events', {
      type: 'GAME_UPDATED',
      gameId,
    });
  }

  // async emitGameEnded(gameId: string) {
  //   return this.request('post', '/internal/events', {
  //     type: 'GAME_ENDED',
  //     gameId,
  //   });
  // }
}