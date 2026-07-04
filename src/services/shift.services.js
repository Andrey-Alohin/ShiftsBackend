import mongoose from 'mongoose';
import createHttpError from 'http-errors';
import { ShiftsCollection } from '../db/models/Shift.js';
import { UsersCollection } from '../db/models/User.js';
import { GroupsCollection } from '../db/models/Group.js';
import { normalizeAndCategorizeOperations } from '../utils/normalizeOperation.js';
import {
  validateInternalOverlaps,
  validateExternalOverlaps,
  buildBulkOperations,
} from '../utils/shift.utils.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { config } from '../config/index.js';
import { getWeekBounds } from '../utils/getWeekBounds.js';
import { assertUtcISOString } from '../utils/dateUtil.js';

export const postShifts = async ({ user, operations, tz }) => {
  const useTz = config.timeZoneEnabled && tz ? tz : config.defaultTimeZone;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Нормалізація
    const {
      categorized,
      allUserIds,
      allGroupIds,
      dataBounds: { minStartDate, maxEndDate },
    } = normalizeAndCategorizeOperations(operations, tz);

    const normalized = categorized.create.concat(categorized.update);
    // 2. Валідація внутрішніх конфліктів
    validateInternalOverlaps(normalized);

    // 3. Перевірка на існування користувачів і груп
    const usersInDb = await UsersCollection.countDocuments({
      _id: { $in: allUserIds },
    }).session(session);
    const groupsInDb = await GroupsCollection.countDocuments({
      _id: { $in: allGroupIds },
    }).session(session);

    if (usersInDb !== allUserIds.length) {
      throw createHttpError(400, 'One or more users do not exist');
    }
    if (groupsInDb !== allGroupIds.length) {
      throw createHttpError(400, 'One or more groups do not exist');
    }

    // 4. Отримання конфліктів з БД одним запитом
    const existingShifts = await ShiftsCollection.find({
      user: { $in: allUserIds },
      startAt: { $lt: maxEndDate },
      endAt: { $gt: minStartDate },
    })
      .session(session)
      .lean();

    // 5. Валідація зовнішніх конфліктів
    validateExternalOverlaps(normalized, existingShifts);

    // 6. Побудова Bulk операцій
    const bulkOps = buildBulkOperations(categorized, user._id);

    if (bulkOps.length > 0) {
      // 7. Виконання Bulk операцій
      const result = await ShiftsCollection.bulkWrite(bulkOps, { session });

      const updateOpsCount = categorized.update.length;
      const deleteOpsCount = categorized.delete.length;

      // Перевіряємо, чи всі оновлення та видалення знайшли свій документ за версією
      if (
        result.matchedCount < updateOpsCount ||
        result.deletedCount < deleteOpsCount
      ) {
        throw createHttpError(
          409,
          'Conflict: One or more shifts were modified or deleted by another user',
        );
      }
    }

    await session.commitTransaction();
    return normalized;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const getWeeklySchedule = async ({ user, date, tz }) => {
  const useTz = config.timeZoneEnabled && tz ? tz : config.defaultTimeZone;

  // 1. Визначити базову дату. Якщо дата не передана, беремо поточну.
  const baseDate = date ? assertUtcISOString(date) : new Date();

  // 2. Отримати межі тижня з урахуванням часової зони.
  const { weekStart, weekEnd } = getWeekBounds(baseDate, useTz);

  // 3. Отримати ID "домашньої" групи користувача.
  const userGroupId = user.groupId;

  // 4. Сформувати запит до БД.
  const shifts = await ShiftsCollection.find({
    // Знайти всі зміни, які перетинаються з нашим тижнем.
    startAt: { $lt: weekEnd },
    endAt: { $gt: weekStart },
    // Або це колеги з моєї групи, або "гості" в моїй групі.
    $or: [{ originGroupId: userGroupId }, { actualGroupId: userGroupId }],
  })
    .populate('user', 'name email') // Одразу отримати дані користувачів.
    .sort({ startAt: 1 }) // Відсортувати для зручності на фронтенді.
    .lean(); // .lean() для кращої продуктивності при читанні.

  return {
    shifts,
    weekBounds: { start: weekStart.toISOString(), end: weekEnd.toISOString() },
  };
};
