import { SESSION_COOKIES } from '../constants/sessionCookies.js';
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshUsersSession,
} from '../services/auth.services.js';
import { setupSession } from '../utils/setupSession.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  setupSession(res, session);

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  const sessionId = req.cookies?.[SESSION_COOKIES.SESSION_ID];
  if (sessionId) {
    await logoutUser(sessionId);
  }

  res.clearCookie(SESSION_COOKIES.SESSION_ID);
  res.clearCookie(SESSION_COOKIES.REFRESH_TOKEN);

  res.status(204).send();
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUsersSession({
    sessionId: req.cookies?.[SESSION_COOKIES.SESSION_ID],
    refreshToken: req.cookies?.[SESSION_COOKIES.REFRESH_TOKEN],
  });

  setupSession(res, session);

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
