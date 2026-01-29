/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateUserDto } from '../models/CreateUserDto';
import type { InlineSchema10 } from '../models/InlineSchema10';
import type { InlineSchema12 } from '../models/InlineSchema12';
import type { InlineSchema4 } from '../models/InlineSchema4';
import type { InlineSchema7 } from '../models/InlineSchema7';
import type { InlineSchema9 } from '../models/InlineSchema9';
import type { Users__username_GetResponse } from '../models/Users__username_GetResponse';
import type { Users_id__id_GetResponse } from '../models/Users_id__id_GetResponse';
import type { UsersGetResponse } from '../models/UsersGetResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PublicService {
    /**
     * Get all users
     * Retrieve a list of all users
     * @returns UsersGetResponse List of users
     * @throws ApiError
     */
    public static usersControllerFindAll(): CancelablePromise<UsersGetResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users',
        });
    }
    /**
     * Create a new user
     * Create a new user with the provided data
     * @returns InlineSchema4 User created
     * @throws ApiError
     */
    public static usersControllerCreate({
        requestBody,
    }: {
        /**
         * User data to create
         */
        requestBody: CreateUserDto,
    }): CancelablePromise<InlineSchema4> {
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
     * Get user by username
     * Retrieve a user by their username
     * @returns Users__username_GetResponse User data
     * @throws ApiError
     */
    public static usersControllerFindOneByUsername({
        username,
    }: {
        /**
         * Username of the user
         */
        username: InlineSchema7,
    }): CancelablePromise<Users__username_GetResponse> {
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
        username: InlineSchema9,
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
     * @returns Users_id__id_GetResponse User data
     * @throws ApiError
     */
    public static usersControllerFindOneById({
        id,
    }: {
        /**
         * ID of the user
         */
        id: InlineSchema10,
    }): CancelablePromise<Users_id__id_GetResponse> {
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
        id: InlineSchema12,
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
