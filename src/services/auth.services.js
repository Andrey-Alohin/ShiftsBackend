import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/User.js';
import { GroupsCollection } from '../db/models/Group.js';
import bcrypt from 'bcrypt';
import { SessionsCollection } from '../db/models/Session.js';
import { createSession } from '../utils/createSession.js';

export const registerUser = async ({ name, email, password, groupId }) => {
  const user = await UsersCollection.findOne({ email });
  if (user) throw createHttpError(409, 'Email already in use');
  const group = await GroupsCollection.findById(groupId);
  if (!group) throw createHttpError(404, 'Group not found');
  const encryptedPassword = await bcrypt.hash(password, 10);

  return await UsersCollection.create({
    name,
    email,
    passwordHash: encryptedPassword,
    groupId,
    role: 'user',
  });
};

export const loginUser = async ({ email, password }) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  const isEqual = await bcrypt.compare(user.passwordHash, password);

  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  const newSession = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) =>
  await SessionsCollection.deleteOne({ _id: sessionId });

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = createSession();

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};
