import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  backend: {
    url: process.env.BACKEND_URL,
  },
}));
