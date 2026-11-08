import { UsersCollection } from '../db/models/User.js';

export const getUser = async (userId) =>
  await UsersCollection.findOne({ _id: userId }).populate('groupId');

export const getUsersByGroup = async (groupId) => {
  const users = await UsersCollection.find({ groupId });
  return users;
};
