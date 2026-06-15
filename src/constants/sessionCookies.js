import { ONE_DAY } from '../constants/index.js';

export const SESSION_COOKIES = {
  REFRESH_TOKEN: 'refreshToken',
  SESSION_ID: 'sessionId',
  getOptions: () => ({
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  }),
};
