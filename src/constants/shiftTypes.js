export const SHIFT_TYPES = Object.freeze({
  WORK: 'work',
  DAY_OFF: 'day_off',
  SICK_LEAVE: 'sick_leave',
  VACATION: 'vacation',
});

export const SHIFT_TYPE_VALUES = Object.freeze(Object.values(SHIFT_TYPES));

export const FULL_DAY_SHIFT_TYPES = Object.freeze([
  SHIFT_TYPES.DAY_OFF,
  SHIFT_TYPES.SICK_LEAVE,
  SHIFT_TYPES.VACATION,
]);
