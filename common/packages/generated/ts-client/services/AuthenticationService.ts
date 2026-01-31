/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * User login
     * Authenticate user and return JWT access token
     * @returns any Login successful, JWT token and user returned
     * @throws ApiError
     */
    public static authControllerLogin({
        requestBody,
    }: {
        /**
         * User credentials
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
        access_token?: string;
        user?: Record<string, any>;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation failed`,
                401: `Invalid credentials`,
            },
        });
    }
    /**
     * User signup
     * Signup user and return JWT access token
     * @returns any Signup successful, JWT token and user returned
     * @throws ApiError
     */
    public static authControllerSignup({
        requestBody,
    }: {
        /**
         * User credentials
         */
        requestBody: {
            /**
             * Username
             */
            username: string;
            /**
             * User email
             */
            email: string;
            /**
             * User password
             */
            password: string;
        },
    }): CancelablePromise<{
        access_token?: string;
        user?: Record<string, any>;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/signup',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                409: `Username or email already exists`,
                500: `Internal Server Error`,
            },
        });
    }
}
