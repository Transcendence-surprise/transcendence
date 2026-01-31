/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginUserDto } from '../models/LoginUserDto';
import type { LoginUserResponseDto } from '../models/LoginUserResponseDto';
import type { SignupUserDto } from '../models/SignupUserDto';
import type { SignupUserResponseDto } from '../models/SignupUserResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * User login
     * Authenticate user and return JWT access token
     * @returns LoginUserResponseDto Login successful, JWT token and user returned
     * @throws ApiError
     */
    public static login({
        requestBody,
    }: {
        /**
         * User credentials
         */
        requestBody: LoginUserDto,
    }): CancelablePromise<LoginUserResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                401: `Invalid credentials`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * User signup
     * Signup user and return JWT access token
     * @returns SignupUserResponseDto Signup successful, JWT token and user returned
     * @returns any
     * @throws ApiError
     */
    public static signup({
        requestBody,
    }: {
        /**
         * User credentials
         */
        requestBody: SignupUserDto,
    }): CancelablePromise<SignupUserResponseDto | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/signup',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                409: `Username or email already exists`,
                500: `Internal server error`,
            },
        });
    }
}
