/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateApiKeyResDto } from '../models/CreateApiKeyResDto';
import type { GetApiKeyResDto } from '../models/GetApiKeyResDto';
import type { LoginUserDto } from '../models/LoginUserDto';
import type { LoginUserResDto } from '../models/LoginUserResDto';
import type { SignupUserDto } from '../models/SignupUserDto';
import type { SignupUserResDto } from '../models/SignupUserResDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
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
    /**
     * User login
     * Authenticate user and return JWT access token
     * @param requestBody User credentials
     * @returns LoginUserResDto Login successful, JWT token and user returned
     * @throws ApiError
     */
    public static login(
        requestBody: LoginUserDto,
    ): CancelablePromise<LoginUserResDto> {
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
     * @param requestBody User credentials
     * @returns SignupUserResDto Signup successful, JWT token and user returned
     * @returns any
     * @throws ApiError
     */
    public static signup(
        requestBody: SignupUserDto,
    ): CancelablePromise<SignupUserResDto | any> {
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
    /**
     * @returns any
     * @throws ApiError
     */
    public static logout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/logout',
            errors: {
                500: `Internal server error`,
            },
        });
    }
    /**
     * User authentication with intra42
     * Redirect user with formed url to intra for authenitcation
     * @returns void
     * @throws ApiError
     */
    public static intra42Auth(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/intra42',
            errors: {
                302: `Redirection to authentication url`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Callback for user returned from intra42
     * Receive code and exchange with intra42 token for user authentication
     * @param code
     * @param state Code was sent in redirection to intra42 and received to ensure, that redirection was not hacked
     * @returns any
     * @throws ApiError
     */
    public static intra42AuthCallback(
        code: string,
        state: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/intra42/callback',
            query: {
                'code': code,
                'state': state,
            },
            errors: {
                302: `Redirection to application with auth cookie set`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get all API keys
     * Retrieve a list of all API keys
     * @returns GetApiKeyResDto List of API keys
     * @throws ApiError
     */
    public static getAllApiKeys(): CancelablePromise<Array<GetApiKeyResDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/api-keys',
            errors: {
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create API key
     * Generate a new API key and return its token and metadata
     * @returns CreateApiKeyResDto API key created
     * @throws ApiError
     */
    public static createApiKey(): CancelablePromise<CreateApiKeyResDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/api-keys',
            errors: {
                400: `Bad request`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Delete API key
     * Remove an API key by id
     * @param id ID of the API key to remove
     * @returns any API key deleted
     * @throws ApiError
     */
    public static removeApiKeyById(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/auth/api-keys',
            path: {
                'id': id,
            },
            errors: {
                404: `API key not found`,
                500: `Internal server error`,
            },
        });
    }
}
