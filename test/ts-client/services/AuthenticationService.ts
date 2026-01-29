/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Auth_loginPostResponse } from '../models/Auth_loginPostResponse';
import type { Auth_signupPostResponse } from '../models/Auth_signupPostResponse';
import type { CreateUserDto1 } from '../models/CreateUserDto1';
import type { ValidateCredDto1 } from '../models/ValidateCredDto1';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * User login
     * Authenticate user and return JWT access token
     * @returns Auth_loginPostResponse Login successful, JWT token and user returned
     * @throws ApiError
     */
    public static authControllerLogin({
        requestBody,
    }: {
        /**
         * User credentials
         */
        requestBody: ValidateCredDto1,
    }): CancelablePromise<Auth_loginPostResponse> {
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
     * @returns Auth_signupPostResponse Signup successful, JWT token and user returned
     * @returns any
     * @throws ApiError
     */
    public static authControllerSignup({
        requestBody,
    }: {
        /**
         * User credentials
         */
        requestBody: CreateUserDto1,
    }): CancelablePromise<Auth_signupPostResponse | any> {
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
