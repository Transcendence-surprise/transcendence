import { registerAs } from '@nestjs/config';

function requireEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`Missing required env var ${name}`);
  }
  return value;
}

export default registerAs('game', () => ({
    test: 'test',
    gateway: {
        baseUrl: requireEnv('GATEWAY_URL', process.env.GATEWAY_URL),
    },
    core: {
        baseUrl: requireEnv('CORE_URL', process.env.CORE_URL),
    },

    internal: {
      serviceKey: requireEnv('INTERNAL_SERVICE_KEY', process.env.INTERNAL_SERVICE_KEY),
    },
}))
