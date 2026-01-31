/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $CreateUserDto = {
    properties: {
        username: {
            type: 'string',
            description: `Username or email for authentication`,
            isRequired: true,
        },
        email: {
            type: 'string',
            description: `Username or email for authentication`,
            isRequired: true,
        },
        password: {
            type: 'string',
            description: `User password`,
            isRequired: true,
        },
    },
} as const;
