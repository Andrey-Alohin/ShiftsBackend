// utils/dateTime.js

import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { startOfDay, addDays } from 'date-fns';

const DEFAULT_TZ = 'Europe/Kyiv';

// -------------------
// VALIDATION
// -------------------

export const assertValidTimezone = (tz) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return tz;
  } catch {
    throw new Error(`Invalid timezone: ${tz}`);
  }
};

export const assertUtcISOString = (value) => {
  if (typeof value !== 'string' || !value.endsWith('Z')) {
    throw new Error('Date must be UTC ISO string (end with Z)');
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  return date;
};

// -------------------
// CONVERSIONS
// -------------------

export const toLocal = (date, tz = DEFAULT_TZ) => {
  assertValidTimezone(tz);
  return toZonedTime(date, tz);
};

export const toUTC = (localDate, tz = DEFAULT_TZ) => {
  assertValidTimezone(tz);
  return fromZonedTime(localDate, tz);
};

// -------------------
// FORMAT (safe)
// -------------------

export const formatLocal = (date, tz = DEFAULT_TZ) => {
  assertValidTimezone(tz);

  return new Intl.DateTimeFormat('uk-UA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const toLocalDate = (date, tz = DEFAULT_TZ) => {
  assertValidTimezone(tz);

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date); // YYYY-MM-DD
};

// -------------------
// DAY RANGE (ключ)
// -------------------

export const buildUtcDayRange = (date, tz = DEFAULT_TZ) => {
  assertValidTimezone(tz);

  // Знаходимо початок дня у вказаній часовій зоні
  const zonedStart = startOfDay(toZonedTime(date, tz));
  // Додаємо рівно один календарний день (враховує DST)
  const zonedEnd = addDays(zonedStart, 1);

  const startAt = fromZonedTime(zonedStart, tz);
  const endAt = fromZonedTime(zonedEnd, tz);

  return { startAt, endAt };
};

// -------------------
// INTERVAL VALIDATION
// -------------------

export const assertValidInterval = (startAt, endAt) => {
  if (!(startAt instanceof Date) || !(endAt instanceof Date)) {
    throw new Error('Invalid Date objects');
  }

  if (startAt >= endAt) {
    throw new Error('startAt must be less than endAt');
  }
};

// -------------------
// HELPERS
// -------------------

export const isSameLocalDay = (date, targetDate, tz = DEFAULT_TZ) => {
  return toLocalDate(date, tz) === targetDate;
};

export const isOverlap = (aStart, aEnd, bStart, bEnd) => {
  return aStart < bEnd && aEnd > bStart;
};
