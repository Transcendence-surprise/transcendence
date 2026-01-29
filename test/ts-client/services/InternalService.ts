/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Users_validate_credentialsPostResponse } from '../models/Users_validate_credentialsPostResponse';
import type { ValidateCredDto } from '../models/ValidateCredDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InternalService {
    /**
     * Validate user credentials
     * Validate user credentials for authentication
     * @returns Users_validate_credentialsPostResponse Credentials are valid, user data returned
     * @throws ApiError
     */
    public static usersControllerValidateCredentials({
        requestBody,
    }: {
        /**
         * User credentials to validate
         */
        requestBody: ValidateCredDto,
    }): CancelablePromise<Users_validate_credentialsPostResponse> {
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
