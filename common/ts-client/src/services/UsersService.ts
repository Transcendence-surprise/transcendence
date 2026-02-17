/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateUserDto } from '../models/CreateUserDto';
import type { GetUserResDto } from '../models/GetUserResDto';
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
    public static getUsers(): CancelablePromise<Array<GetUserResDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users',
        });
    }
    /**
     * Create a new user
     * Create a new user with the provided data
     * @param requestBody User data to create
     * @returns GetUserResDto User created
     * @throws ApiError
     */
    public static createUser(
        requestBody: CreateUserDto,
    ): CancelablePromise<GetUserResDto> {
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
     * @param email
     * @returns any
     * @throws ApiError
     */
    public static usersControllerGetUserByEmail(
        email: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/by-email/{email}',
            path: {
                'email': email,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static usersControllerGetUserByHisToken(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me',
        });
    }
    /**
     * Get user by ID
     * Retrieve a user by their ID (authenticated user only)
     * @param id ID of the user
     * @returns GetUserResDto User data
     * @throws ApiError
     */
    public static getUserById(
        id: number,
    ): CancelablePromise<GetUserResDto> {
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
     * @param id ID of the user to delete
     * @returns any User deleted
     * @throws ApiError
     */
    public static deleteUserById(
        id: number,
    ): CancelablePromise<any> {
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
