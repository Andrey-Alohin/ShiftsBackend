import createHttpError from 'http-errors';
import { ROLES } from '../constants/index.js';

export const requireRoles =
  (...roles) =>
  async (req, res, next) => {
    const { user } = req;
    if (!user) {
      next(createHttpError(401, 'Not authorized'));
      return;
    }

    const { role } = user;

    return !roles.includes(role)
      ? next(createHttpError(403, 'Forbidden'))
      : next();
  };
