import Joi from 'joi';
import { joiPasswordExtendCore } from 'joi-password';

const joiPassword = Joi.extend(joiPasswordExtendCore);

export const registrationUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: joiPassword
    .string()
    .min(7)
    .max(20)
    .minOfUppercase(1)
    .minOfLowercase(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .required(),
  groupId: Joi.string().min(1).required(),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: joiPassword
    .string()
    .min(7)
    .max(20)
    .minOfUppercase(1)
    .minOfLowercase(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .required(),
});
