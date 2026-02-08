import Joi from 'joi';
import { joiPasswordExtendCore } from 'joi-password';

const joiPassword = Joi.extend(joiPasswordExtendCore);

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: joiPassword
    .string()
    .min(8)
    .max(64)
    .minOfUppercase(1)
    .minOfLowercase(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .required(),
  groupId: Joi.string().hex().length(24).required(),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
