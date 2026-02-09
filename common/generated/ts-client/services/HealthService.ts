/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HealthService {
    /**
     * Health check
     * Check if the service is running and healthy
     * @returns any Service is healthy
     * @throws ApiError
     */
    public static coreHealth(): CancelablePromise<{
        status?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/health',
        });
    }
}
