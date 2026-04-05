import Joi from 'joi';

export const postShiftsSchema = Joi.object({
  anchorDate: Joi.string().isoDate().required(),
  shifts: Joi.array()
    .min(1)
    .items(
      Joi.object({
        userId: Joi.string().hex().length(24).required(),
        startAt: Joi.string().isoDate().required(),
        endAt: Joi.string().isoDate().required(),
      }).custom((values, helpers) => {
        const start = new Date(values.startAt);
        const end = new Date(values.endAt);
        return start >= end
          ? helpers.message('startAt must be less than endAt')
          : values;
      }, 'Time validation'),
    )
    .required(),
});
