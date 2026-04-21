import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import type { FastifyRequest } from 'fastify';

interface JwtPayload {
	sub: number;
	username: string;
	email: string;
	roles: string[];
}

interface RequestWithUser extends FastifyRequest {
	user?: JwtPayload;
}

@Injectable()
export class BadgeHttpService {
	constructor(private readonly http: HttpService) {}

	async getBadges<T = unknown>(
		req?: FastifyRequest,
	): Promise<{ statusCode: number; data: T }> {
		return this.request<T>('/api/badges', 'get', undefined, req);
	}

	async getUserBadges<T = unknown>(req?: FastifyRequest): Promise<T> {
		const { data } = await this.request<T>(
			'/api/badges/badges/unlocked',
			'get',
			undefined,
			req,
			true,
		);
		return data;
	}

	private async request<T>(
		path: string,
		method: 'get' | 'post' | 'delete' | 'put' | 'patch' = 'get',
		body?: unknown,
		req?: FastifyRequest,
		requireUser = false,
	): Promise<{ statusCode: number; data: T }> {
		const headers = this.buildForwardHeaders(req, requireUser);

		if (req?.headers?.['content-type']) {
			headers['content-type'] = req.headers['content-type'];
		}

		if (method !== 'get' && method !== 'delete' && !headers['content-type']) {
			headers['content-type'] = 'application/json';
		}

		const config = { headers };

		const res = method === 'get' || method === 'delete'
			? await lastValueFrom(this.http[method]<T>(path, config))
			: await lastValueFrom(this.http[method]<T>(path, body ?? {}, config));

		return {
			statusCode: res.status,
			data: res.data,
		};
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
			return headers;
		}

		if (requireUser) {
			throw new UnauthorizedException('Missing authenticated user context');
		}

		return headers;
	}
}
