import { registerAs } from '@nestjs/config';

function requireEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`Missing required env var ${name}`);
  }
  return value;
}

export default registerAs('gateway', () => ({
    test: 'test',
    auth: {
        jwtSecret: requireEnv('JWT_SECRET', process.env.JWT_SECRET),
        baseUrl: requireEnv('AUTH_SERVICE_URL', process.env.AUTH_SERVICE_URL),
    },
    backend: {
        baseUrl: requireEnv('BACKEND_URL', process.env.BACKEND_URL),
    },
    game: {
        baseUrl: requireEnv('GAME_SERVICE_URL', process.env.GAME_SERVICE_URL),
    }
}))
