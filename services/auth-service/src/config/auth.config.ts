import { registerAs } from '@nestjs/config';

function requireEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`Missing required env var ${name}`);
  }
  return value;
}

export default registerAs('auth', () => ({
  backend: {
    url: process.env.BACKEND_URL,
  },
  intra42: {
    clientId: requireEnv('INTRA_UID', process.env.INTRA_UID),
    secret: requireEnv('INTRA_SECRET', process.env.INTRA_SECRET),
    authUrl: requireEnv('INTRA_AUTH_URL', process.env.INTRA_AUTH_URL),
    tokenUrl: requireEnv('INTRA_TOKEN_URL', process.env.INTRA_TOKEN_URL),
    userUrl: requireEnv('INTRA_USER_URL', process.env.INTRA_USER_URL),
    redirectUri: requireEnv(
      'INTRA_REDIRECT_URI',
      process.env.INTRA_REDIRECT_URI,
    ),
  },
}));
