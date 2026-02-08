import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/User.js';
import { GroupsCollection } from '../db/models/Group.js';
import bcrypt from 'bcrypt';

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
