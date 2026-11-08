import { UsersCollection } from '../db/models/User.js';

export const getAllUsers = async (groupId) => {
  const users = await UsersCollection.find({ groupId });
  return users;
};
