import { SESSION_COOKIES } from '../constants/sessionCookies.js';

export const setupSession = (res, { refreshToken, _id }) => {
  res.cookie(
    SESSION_COOKIES.REFRESH_TOKEN,
    refreshToken,
    SESSION_COOKIES.getOptions(),
  );
  res.cookie(SESSION_COOKIES.SESSION_ID, _id, SESSION_COOKIES.getOptions());
};
