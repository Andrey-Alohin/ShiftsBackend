export const getUserController = async (req, res) => {
  const { user } = req;
  //   const info = await getUser(user);

  res.status(200).json({
    status: 200,
    message: 'Success get user info',
    data: user,
  });
};
