import { SetMetadata } from "@nestjs/common";

export enum AuthType {
    JWT = 'jwt',
    JWT_OR_API_KEY = 'jwt-or-api-key',
    API_KEY_ONLY = 'api-key-only',
    PUBLIC = 'public',
}

export const AUTH_TYPE_KEY = 'authType';
export const Auth = (type: AuthType) => SetMetadata(AUTH_TYPE_KEY, type);
