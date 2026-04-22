import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import type { FastifyRequest } from 'fastify';

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
	constructor(private readonly http: HttpService) {}

	async getFriends<T = unknown>(req: FastifyRequest): Promise<T> {
		return this.request<T>('get', '/api/friends', undefined, req, true);
	}

	async getFriendRequests<T = unknown>(req: FastifyRequest): Promise<T> {
		return this.request<T>('get', '/api/friends/requests', undefined, req, true);
	}

	async sendFriendRequest<T = unknown>(body: unknown, req: FastifyRequest): Promise<T> {
		return this.request<T>('post', '/api/friends/request', body, req, true);
	}

	async acceptFriendRequest<T = unknown>(body: unknown, req: FastifyRequest): Promise<T> {
		return this.request<T>('post', '/api/friends/accept', body, req, true);
	}

	async rejectFriendRequest<T = unknown>(body: unknown, req: FastifyRequest): Promise<T> {
		return this.request<T>('post', '/api/friends/reject', body, req, true);
	}

	async removeFriend<T = unknown>(body: unknown, req: FastifyRequest): Promise<T> {
		return this.request<T>('delete', '/api/friends', body, req, true);
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
		let response;

		if (method === 'get') {
			response = await lastValueFrom(this.http.get<T>(path, config));
		} else if (method === 'delete') {
			response = await lastValueFrom(
				this.http.delete<T>(path, {
					...config,
					data: body ?? {},
				}),
			);
		} else {
			response = await lastValueFrom(this.http[method]<T>(path, body ?? {}, config));
		}

		return response.data;
	}
}
