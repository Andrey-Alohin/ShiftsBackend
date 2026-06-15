import {
  assertUtcISOString,
  assertValidInterval,
  buildUtcDayRange,
} from './dateUtil.js';

export const normalizeShift = (dto, tz) => {
  const startAt = assertUtcISOString(dto.startAt);
  const endAt = assertUtcISOString(dto.endAt);

  if (dto.type === 'day_off') {
    return {
      ...dto,
      ...buildUtcDayRange(startAt, tz),
    };
  }

  assertValidInterval(startAt, endAt);

  return {
    ...dto,
    startAt,
    endAt,
  };
};
