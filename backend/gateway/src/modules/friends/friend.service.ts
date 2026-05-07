// src/modules/friends/friend.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import type { FastifyRequest } from 'fastify';
import { RealtimeGateway } from '../realtime/realtime.gateway';

interface JwtPayload {
	sub: number | string;
	username: string;
	email: string;
	roles: string[];
}

interface RequestWithUser extends FastifyRequest {
	user?: JwtPayload;
}

@Injectable()
export class FriendHttpService {
	constructor(
    private readonly http: HttpService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

	async getFriends<T = unknown>(req: FastifyRequest): Promise<T> {
		return this.request<T>('get', '/api/friends', undefined, req, true);
	}

	async getFriendRequests<T = unknown>(req: FastifyRequest): Promise<T> {
		const result = await this.request<T>('get', '/api/friends/requests', undefined, req, true);
    return result;
	}

	async sendFriendRequest<T = unknown>(body: unknown, req: FastifyRequest): Promise<T> {
		const result =   await this.request<T>('post', '/api/friends/request', body, req, true);
    this.notifyFriendsChanged(req, body);
    return result;
	}

	async acceptFriendRequest<T = unknown>(body: unknown, req: FastifyRequest): Promise<T> {
		const result =   await this.request<T>('post', '/api/friends/accept', body, req, true);
    this.notifyFriendsChanged(req, body);
    return result;
	}

	async rejectFriendRequest<T = unknown>(body: unknown, req: FastifyRequest): Promise<T> {
		const result =   await this.request<T>('post', '/api/friends/reject', body, req, true);
    this.notifyFriendsChanged(req, body);
    return result;
	}

	async removeFriend<T = unknown>(body: unknown, req: FastifyRequest): Promise<T> {
		const result =   await this.request<T>('delete', '/api/friends', body, req, true);
    this.notifyFriendsChanged(req, body);
    return result;
	}

  async getFriendsSnapshot<T = unknown>(req: FastifyRequest): Promise<T> {
    return this.request<T>('get', '/api/friends/snapshot', undefined, req, true);
  }

  async getFriendsSnapshotByUser<T = unknown>(
    user: JwtPayload
  ): Promise<T> {
    const headers = this.buildHeadersFromUser(user);

		const response: AxiosResponse<T> = await lastValueFrom(
      this.http.get<T>('/api/friends/snapshot', { headers }),
    );

    return response.data;
  }

	private buildForwardHeaders(
		req?: FastifyRequest,
		requireUser = false,
	): Record<string, string> {
		const headers: Record<string, string> = {};

		const reqWithUser = req as RequestWithUser | undefined;
		if (reqWithUser?.user) {
			headers['x-user-id'] = String(reqWithUser.user.sub);
			headers['x-user-username'] = reqWithUser.user.username;
			headers['x-user-email'] = reqWithUser.user.email;
			headers['x-user-roles'] = Array.isArray(reqWithUser.user.roles)
				? reqWithUser.user.roles.join(',')
				: String(reqWithUser.user.roles);
		} else if (requireUser) {
			throw new UnauthorizedException('Missing authenticated user context');
		}

		if (req?.headers?.['content-type'] && typeof req.headers['content-type'] === 'string') {
			headers['content-type'] = req.headers['content-type'];
		}

		const passThroughHeaders = [
			'authorization',
			'x-request-id',
			'x-real-ip',
			'x-forwarded-for',
			'x-forwarded-proto',
			'x-forwarded-host',
		];

		passThroughHeaders.forEach((headerName) => {
			const value = req?.headers?.[headerName];
			if (typeof value === 'string' && value.trim().length > 0) {
				headers[headerName] = value;
			}
		});

		return headers;
	}

	private async request<T>(
		method: 'get' | 'post' | 'delete' | 'put' | 'patch',
		path: string,
		body?: unknown,
		req?: FastifyRequest,
		requireUser = false,
	): Promise<T> {
		const headers = this.buildForwardHeaders(req, requireUser);
		const hasBody = method !== 'get';

		if (hasBody && !headers['content-type']) {
			headers['content-type'] = 'application/json';
		}

		const config = { headers };
		let response: AxiosResponse<T> | undefined;

		switch (method) {
			case 'get':
				response = await lastValueFrom(this.http.get<T>(path, config));
				break;
			case 'delete':
				response = await lastValueFrom(
					this.http.delete<T>(path, {
						...config,
						data: body ?? {},
					}),
				);
				break;
			case 'post':
				response = await lastValueFrom(this.http.post<T>(path, body ?? {}, config));
				break;
			case 'put':
				response = await lastValueFrom(this.http.put<T>(path, body ?? {}, config));
				break;
			case 'patch':
				response = await lastValueFrom(this.http.patch<T>(path, body ?? {}, config));
				break;
			default:
				throw new Error(`Unsupported method`);
		}

		if (!response) {
			throw new Error('No response from friends service');
		}

		return response.data;
	}

  private buildHeadersFromUser(user: JwtPayload): Record<string, string> {
    return {
      'x-user-id': String(user.sub),
      'x-user-username': user.username,
      'x-user-email': user.email,
      'x-user-roles': user.roles.join(','),
    };
  }

  private extractTargetUserId(body: unknown): number | null {
    if (!body || typeof body !== 'object') return null;

    const target = (body as { targetUserId?: unknown }).targetUserId;
    const id = Number(target);

    if (!Number.isInteger(id) || id <= 0) return null;

    return id;
  }

  private notifyFriendsChanged(
  req: FastifyRequest,
  body: unknown,
) {
  const reqWithUser = req as RequestWithUser;

  const currentUserId = Number(reqWithUser.user?.sub);
  const targetUserId = this.extractTargetUserId(body);

  if (!currentUserId || !targetUserId) return;

  this.realtimeGateway.emitter.emitFriendsUpdate([
    currentUserId,
    targetUserId,
  ]);
}
}
