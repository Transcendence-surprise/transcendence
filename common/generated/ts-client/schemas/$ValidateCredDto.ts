/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ValidateCredDto = {
    properties: {
        identifier: {
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
