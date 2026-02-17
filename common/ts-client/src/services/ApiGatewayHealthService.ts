/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiGatewayHealthService {
    /**
     * API Gateway health check
     * Check if the API Gateway is running and healthy
     * @returns any API Gateway is healthy
     * @throws ApiError
     */
    public static apiGatewayHealth(): CancelablePromise<{
        status?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/health',
        });
    }
}
