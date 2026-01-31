/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponseDto } from '../models/AuthResponseDto';
import type { LoginUserDto } from '../models/LoginUserDto';
import type { SignupUserDto } from '../models/SignupUserDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * User login
     * Authenticate user and return JWT access token
     * @returns AuthResponseDto Login successful, JWT token and user returned
     * @throws ApiError
     */
    public static login({
        requestBody,
    }: {
        /**
         * User credentials
         */
        requestBody: LoginUserDto,
    }): CancelablePromise<AuthResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation failed`,
                401: `Invalid credentials`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * User signup
     * Signup user and return JWT access token
     * @returns any Signup successful, JWT token and user returned
     * @throws ApiError
     */
    public static signup({
        requestBody,
    }: {
        /**
         * User credentials
         */
        requestBody: SignupUserDto,
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
                500: `Internal server error`,
            },
        });
    }
}
