import { registerUser } from '../services/auth.services.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);
};
