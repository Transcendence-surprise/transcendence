/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GameHealthService {
    /**
     * Game service health check
     * Check if the game service is running and healthy
     * @returns any Game service is healthy
     * @throws ApiError
     */
    public static healthControllerHealth(): CancelablePromise<{
        status?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/health',
        });
    }
}
