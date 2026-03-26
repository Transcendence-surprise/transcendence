import { GetUserResDto } from './get-user-res.dto';

/**
 * Internal DTO for auth service responses containing JWT token
 * This is NOT exposed in the API - the token is set as HttpOnly cookie
 */
export class AuthTokenResponseDto {
  access_token: string;
  user: GetUserResDto;
}
