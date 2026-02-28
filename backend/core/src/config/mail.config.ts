import { registerAs } from '@nestjs/config';

function requireEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`Missing required env var ${name}`);
  }
  return value;
}

export default registerAs('mail', () => ({
  host: requireEnv('MAIL_HOST', process.env.MAIL_HOST),
  port: Number(requireEnv('MAIL_PORT', process.env.MAIL_PORT)),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: requireEnv('MAIL_USER', process.env.MAIL_USER),
    pass: requireEnv('MAIL_PASSWORD', process.env.MAIL_PASSWORD),
  },
  from: {
    name: process.env.MAIL_FROM_NAME ?? 'Transcendence',
    address: requireEnv('MAIL_FROM_ADDRESS', process.env.MAIL_FROM_ADDRESS),
  },
}));
