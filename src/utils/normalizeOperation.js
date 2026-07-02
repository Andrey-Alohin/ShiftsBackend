import {
  assertUtcISOString,
  assertValidInterval,
  buildUtcDayRange,
} from './dateUtil.js';

/**
 * Нормалізує дати для однієї зміни (для операцій create/update).
 * Обробляє типи 'work' та 'day_off'.
 * @param {object} shift - Об'єкт зміни.
 * @param {string} tz - Часова зона.
 * @returns {object} - Нормалізований об'єкт зміни з датами у форматі Date.
 */
const normalizeShiftData = (shift, tz) => {
  if (shift.type === 'day_off') {
    // Для вихідного дня нам потрібна лише одна дата, щоб визначити добу
    const date = assertUtcISOString(shift.startAt);
    return {
      ...shift,
      ...buildUtcDayRange(date, tz),
    };
  }

  // Для робочої зміни валідуємо і перетворюємо обидві дати
  const startAt = assertUtcISOString(shift.startAt);
  const endAt = assertUtcISOString(shift.endAt);
  assertValidInterval(startAt, endAt);

  return { ...shift, startAt, endAt };
};

/**
 * Обробляє масив операцій зі змінами.
 * Категоризує їх, нормалізує дані, збирає ID для валідації та визначає часові межі.
 * @param {Array<object>} operations - Масив операцій з тіла запиту.
 * @param {string} tz - Часова зона.
 * @returns {object} Об'єкт з підготовленими даними : масиви змін по категоріям (створені/оновлені/на видалення), id - користувачів, id - груп, максимальний початок та кінець змін.
 */
export const normalizeAndCategorizeOperations = (operations, tz) => {
  const categorized = { create: [], update: [], delete: [] };
  const userIds = new Set();
  const groupIds = new Set();
  let minStartTime = null;
  let maxEndTime = null;

  for (const { operation, shift } of operations) {
    if (operation === 'create' || operation === 'update') {
      const normalizedShift = normalizeShiftData(shift, tz);
      categorized[operation].push(normalizedShift);

      userIds.add(normalizedShift.user.toString());
      groupIds.add(normalizedShift.actualGroupId.toString());
      groupIds.add(normalizedShift.originGroupId.toString());

      const startTs = normalizedShift.startAt.getTime();
      const endTs = normalizedShift.endAt.getTime();

      if (minStartTime === null || startTs < minStartTime) {
        minStartTime = startTs;
      }
      if (maxEndTime === null || endTs > maxEndTime) {
        maxEndTime = endTs;
      }
    } else if (operation === 'delete') {
      // Для видалення нам потрібен лише сам об'єкт shift з _id та version
      categorized.delete.push(shift);
    }
  }

  return {
    categorized,
    allUserIds: [...userIds],
    allGroupIds: [...groupIds],
    dataBounds: {
      minStartDate: minStartTime ? new Date(minStartTime) : null,
      maxEndDate: maxEndTime ? new Date(maxEndTime) : null,
    },
  };
};
