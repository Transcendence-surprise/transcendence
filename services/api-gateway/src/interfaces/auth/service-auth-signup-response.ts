export interface AuthSignupResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    email?: string;
    [key: string]: any;
  };
  [key: string]: any;
}
