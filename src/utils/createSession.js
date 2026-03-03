import { randomBytes, rendomBytes } from 'crypto';
import { ONE_DAY, ONE_HOUR } from '../constants/index.js';

export const createSession = () => ({
  accessToken: randomBytes(30).toString('base64'),
  refreshToken: randomBytes(30).toString('base64'),
  accessTokenValidUntil: new Date(Date.now() + ONE_HOUR),
  refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
});
