import { registerAs } from '@nestjs/config';

function requireEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`Missing required env var ${name}`);
  }
  return value;
}

export default registerAs('auth', () => ({
  NODE_ENV: requireEnv('NODE_ENV', process.env.NODE_ENV),
  jwt: {
    secret: requireEnv('JWT_SECRET', process.env.JWT_SECRET),
  },
  frontend: {
    url: requireEnv('FRONTEND_URL', process.env.FRONTEND_URL),
  },
  core: {
    url: requireEnv('CORE_URL', process.env.CORE_URL),
  },
  intra42: {
    clientId: requireEnv('INTRA_UID', process.env.INTRA_UID),
    secret: requireEnv('INTRA_SECRET', process.env.INTRA_SECRET),
    authUrl: requireEnv('INTRA_AUTH_URL', process.env.INTRA_AUTH_URL),
    tokenUrl: requireEnv('INTRA_TOKEN_URL', process.env.INTRA_TOKEN_URL),
    userUrl: requireEnv('INTRA_USER_URL', process.env.INTRA_USER_URL),
    redirectUri: requireEnv('INTRA_REDIRECT_URI', process.env.INTRA_REDIRECT_URI),
  },
  db: {
    host: requireEnv('POSTGRES_HOST', process.env.POSTGRES_HOST),
    port: requireEnv('POSTGRES_PORT', process.env.POSTGRES_PORT),
    username: requireEnv('POSTGRES_USER', process.env.POSTGRES_USER),
    password: requireEnv('POSTGRES_PASSWORD', process.env.POSTGRES_PASSWORD),
    databse: requireEnv('POSTGRES_DB', process.env.POSTGRES_DB),
    autoLoadEntities: true,
    synchonize: false,
  },
  apiKey: {
    secret: requireEnv('API_KEY_SECRET', process.env.API_KEY_SECRET),
    expirySeconds: requireEnv('API_KEY_EXPIRY_SECONDS', process.env.API_KEY_EXPIRY_SECONDS),
  }
}));
