/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $SignupUserDto = {
    properties: {
        username: {
            type: 'string',
            description: `Username`,
            isRequired: true,
            maxLength: 32,
            minLength: 1,
        },
        email: {
            type: 'string',
            description: `User email`,
            isRequired: true,
            format: 'email',
            maxLength: 32,
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
