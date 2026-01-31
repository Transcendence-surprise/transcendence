/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InternalService {
    /**
     * Validate user credentials
     * Validate user credentials for authentication
     * @returns any Credentials are valid, user data returned
     * @throws ApiError
     */
    public static usersControllerValidateCredentials({
        requestBody,
    }: {
        /**
         * User credentials to validate
         */
        requestBody: {
            /**
             * Username or email for authentication
             */
            identifier: string;
            /**
             * User password
             */
            password: string;
        },
    }): CancelablePromise<{
        id?: number;
        username?: string;
        email?: string;
        userType?: string;
        createdAt?: string;
        updatedAt?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/validate-credentials',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                401: `Invalid credentials`,
            },
        });
    }
}
