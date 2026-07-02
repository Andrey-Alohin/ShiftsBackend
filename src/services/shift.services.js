import mongoose from 'mongoose';
import createHttpError from 'http-errors';
import { ShiftsCollection } from '../db/models/Shift.js';
import { UsersCollection } from '../db/models/User.js';
import { GroupsCollection } from '../db/models/Group.js';
import {
  normalizeAndCategorizeOperations,
  normalizeOperation,
  normalizeShift,
} from '../utils/normalizeOperation.js';
import {
  validateInternalOverlaps,
  validateExternalOverlaps,
  buildBulkOperations,
} from '../utils/shift.utils.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { config } from '../config/index.js';

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

    // 6. Виконання Bulk операцій
    const bulkOps = buildBulkOperations(categorized, user._id);

    if (bulkOps.length > 0) {
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
