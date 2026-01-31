/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AuthResponseDto = {
    properties: {
        access_token: {
            type: 'string',
            isRequired: true,
        },
        user: {
            type: 'UserResponseDto',
            isRequired: true,
        },
    },
} as const;
