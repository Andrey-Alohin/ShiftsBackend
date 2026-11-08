import { getAllUsers } from '../services/users.services.js  ';

export const getUserController = async (req, res) => {
  const { user } = req;
  //   const info = await getUser(user);

  res.status(200).json({
    status: 200,
    message: 'Success get user info',
    data: user,
  });
};

export const getAllUsersController = async (req, res) => {
  const { user } = req;

  const users = await getAllUsers(user.groupId._id);
  console.log(user.groupId.name);

  res.status(200).json({
    status: 200,
    message: `Success get users of ${user.groupId.name}`,
    data: users,
  });
};
