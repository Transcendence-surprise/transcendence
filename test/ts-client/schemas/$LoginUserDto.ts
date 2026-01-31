/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $LoginUserDto = {
    properties: {
        identifier: {
            type: 'string',
            description: `Username or email for authentication`,
            isRequired: true,
            maxLength: 255,
            minLength: 1,
        },
        password: {
            type: 'string',
            description: `User password`,
            isRequired: true,
            maxLength: 72,
            minLength: 1,
        },
    },
} as const;
