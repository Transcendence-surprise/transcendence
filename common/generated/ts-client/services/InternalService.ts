/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetUserResDto } from '../models/GetUserResDto';
import type { ValidateCredDto } from '../models/ValidateCredDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InternalService {
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
}
