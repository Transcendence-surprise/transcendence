/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthHealthService {
    /**
     * Auth service health check
     * Check if the auth service is running and healthy
     * @returns any Auth service is healthy
     * @throws ApiError
     */
    public static authHealth(): CancelablePromise<{
        status?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/health',
            errors: {
                500: `Internal server error`,
            },
        });
    }
}
