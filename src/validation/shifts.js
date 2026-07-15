import Joi from 'joi';
import { SHIFT_TYPE_VALUES, SHIFT_TYPES } from '../constants/shiftTypes.js';

const isUTC = (values, helpers) => {
  if (!values.endsWith('Z')) {
    return helpers.message('Date must be in UTC (end with Z)');
  }
  return values;
};

const shiftCreateSchema = Joi.object({
  user: Joi.string().hex().length(24).required(),
  actualGroupId: Joi.string().hex().length(24).required(),
  originGroupId: Joi.string().hex().length(24).required(),
  type: Joi.string()
    .valid(...SHIFT_TYPE_VALUES)
    .required(),
  startAt: Joi.string()
    .pattern(
      /^[2][0][0-9][0-9]-([0][1-9]|[1][0-2])-([0-2][0-9]|[3][0-1])T([0-1][0-9]|[2][0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9][0-9][0-9]Z|Z)$/,
    )
    .custom(isUTC)
    .required(),
  endAt: Joi.string()
    .pattern(
      /^[2][0][0-9][0-9]-([0][1-9]|[1][0-2])-([0-2][0-9]|[3][0-1])T([0-1][0-9]|[2][0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9][0-9][0-9]Z|Z)$/,
    )
    .custom(isUTC)
    .when('type', {
      is: SHIFT_TYPES.WORK,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
}).custom((values, helpers) => {
  if (values.type === SHIFT_TYPES.WORK) {
    if (new Date(values.startAt) >= new Date(values.endAt)) {
      return helpers.message('startAt must be less than endAt');
    }
  }
  return values;
}, 'Time validation');

const shiftDeleteSchema = Joi.object({
  _id: Joi.string().hex().length(24).required(),
  version: Joi.number().greater(-1).required(),
});

const shiftUpdateSchema = shiftCreateSchema.concat(shiftDeleteSchema);

export const postShiftsSchema = Joi.array()
  .min(1)
  .items(
    Joi.object({
      operation: Joi.string().valid('create', 'update', 'delete').required(),
      shift: Joi.alternatives()
        .conditional('operation', {
          switch: [
            {
              is: Joi.string().valid('create'),
              then: shiftCreateSchema.required(),
            },
            {
              is: Joi.string().valid('update'),
              then: shiftUpdateSchema.required(),
            },
            {
              is: Joi.string().valid('delete'),
              then: shiftDeleteSchema.required(),
            },
          ],
        })
        .required(),
    }),
  );
