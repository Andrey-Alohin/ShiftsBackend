import createHttpError from 'http-errors';
import { getUser, getUsersByGroup } from '../services/users.services.js';

export const getUserController = async (req, res) => {
  const { user } = req;
  const info = await getUser(user._id);
  if (!info) {
    throw createHttpError(401, 'User not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Success get user info',
    data: info,
  });
};

export const getUsersByGroupController = async (req, res) => {
  const { user } = req;

  const users = await getUsersByGroup(user.groupId);
  res.status(200).json({
    status: 200,
    message: `Success get users of your group`,
    data: users,
  });
};
