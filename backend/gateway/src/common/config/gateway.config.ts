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
        isAuthEnabled: requireEnv('IS_AUTH_ENABLED', process.env.IS_AUTH_ENABLED),
        jwtSecret: requireEnv('JWT_SECRET', process.env.JWT_SECRET),
        baseUrl: requireEnv('AUTH_URL', process.env.AUTH_URL),
    },
    core: {
        baseUrl: requireEnv('CORE_URL', process.env.CORE_URL),
    },
    game: {
        baseUrl: requireEnv('GAME_URL', process.env.GAME_URL),
    }
}))
