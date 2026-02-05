/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateUserDto } from '../models/CreateUserDto';
import type { GetUserResDto } from '../models/GetUserResDto';
import type { ValidateCredDto } from '../models/ValidateCredDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Get all users
     * Retrieve a list of all users
     * @returns GetUserResDto List of users
     * @throws ApiError
     */
    public static usersControllerFindAll(): CancelablePromise<Array<GetUserResDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users',
        });
    }
    /**
     * Create a new user
     * Create a new user with the provided data
     * @returns GetUserResDto User created
     * @throws ApiError
     */
    public static usersControllerCreate({
        requestBody,
    }: {
        /**
         * User data to create
         */
        requestBody: CreateUserDto,
    }): CancelablePromise<GetUserResDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                409: `User already exists`,
            },
        });
    }
    /**
     * Validate user credentials
     * Validate user credentials for authentication
     * @returns GetUserResDto Credentials are valid, user data returned
     * @throws ApiError
     */
    public static usersControllerValidateCredentials({
        requestBody,
    }: {
        /**
         * User credentials to validate
         */
        requestBody: ValidateCredDto,
    }): CancelablePromise<GetUserResDto> {
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
    /**
     * Get user by username
     * Retrieve a user by their username
     * @returns GetUserResDto User data
     * @throws ApiError
     */
    public static usersControllerFindOneByUsername({
        username,
    }: {
        /**
         * Username of the user
         */
        username: string,
    }): CancelablePromise<GetUserResDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/{username}',
            path: {
                'username': username,
            },
            errors: {
                404: `User not found`,
            },
        });
    }
    /**
     * Delete user by username
     * Delete a user by their username
     * @returns any User deleted
     * @throws ApiError
     */
    public static usersControllerRemoveByUsername({
        username,
    }: {
        /**
         * Username of the user to delete
         */
        username: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/{username}',
            path: {
                'username': username,
            },
            errors: {
                404: `User not found`,
            },
        });
    }
    /**
     * Get user by ID
     * Retrieve a user by their ID (authenticated user only)
     * @returns GetUserResDto User data
     * @throws ApiError
     */
    public static usersControllerFindOneById({
        id,
    }: {
        /**
         * ID of the user
         */
        id: number,
    }): CancelablePromise<GetUserResDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/id/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `User not found`,
            },
        });
    }
    /**
     * Delete user by ID
     * Delete a user by their ID
     * @returns any User deleted
     * @throws ApiError
     */
    public static usersControllerRemoveById({
        id,
    }: {
        /**
         * ID of the user to delete
         */
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/id/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `User not found`,
            },
        });
    }
}
