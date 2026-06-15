import Joi from 'joi';

const isUTC = (values, helpers) => {
  if (!values.endsWith('Z')) {
    return helpers.message('Date must be in UTC (end with Z)');
  }
  return values;
};

export const postShiftsSchema = Joi.array()
  .min(1)
  .items(
    Joi.object({
      user: Joi.string().hex().length(24).required(),
      actualGroupId: Joi.string().hex().length(24).required(),
      originGroupId: Joi.string().hex().length(24).required(),
      type: Joi.string().valid('work', 'day_off').required(),
      startAt: Joi.string().isoDate().custom(isUTC).required(),
      endAt: Joi.string().isoDate().custom(isUTC).required(),
    }).custom((values, helpers) => {
      const start = new Date(values.startAt);
      const end = new Date(values.endAt);

      if (isNaN(start) || isNaN(end)) {
        return helpers.error('any.invalid');
      }

      if (start >= end) {
        return helpers.message('startAt must be less than endAt');
      }
      return values;
    }, 'Time validation'),
  )
  .required();
