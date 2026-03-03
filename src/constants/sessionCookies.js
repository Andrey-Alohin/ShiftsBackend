import { ONE_DAY } from './index.js';

export const SESSION_COOKIES = {
  REFRESH_TOKEN: 'refreshToken',
  SESSION_ID: 'session_id',
  getOptions: () => ({
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  }),
};
