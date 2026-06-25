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
    const { categorized, allUserIds, allGroupIds } =
      normalizeAndCategorizeOperations(operations);
    // 2. Валідація внутрішніх конфліктів
    validateInternalOverlaps(normalized);

    // 3. Валідація існування сутностей та підготовка меж пошуку
    const userIds = [...new Set(normalized.map((s) => s.user.toString()))];
    const groupIds = [
      ...new Set(
        normalized.flatMap((s) => [
          s.actualGroupId.toString(),
          s.originGroupId.toString(),
        ]),
      ),
    ];

    const [usersInDb, groupsInDb] = await Promise.all([
      UsersCollection.countDocuments({ _id: { $in: userIds } }).session(
        session,
      ),
      GroupsCollection.countDocuments({ _id: { $in: groupIds } }).session(
        session,
      ),
    ]);

    if (usersInDb !== userIds.length) {
      throw createHttpError(400, 'One or more users do not exist');
    }
    if (groupsInDb !== groupIds.length) {
      throw createHttpError(400, 'One or more groups do not exist');
    }

    const startTimes = normalized.map((s) => s.startAt.getTime());
    const endTimes = normalized.map((s) => s.endAt.getTime());

    const minStart = new Date(Math.min(...startTimes));
    const maxEnd = new Date(Math.max(...endTimes));

    // 4. Отримання конфліктів з БД одним запитом
    const existingShifts = await ShiftsCollection.find({
      user: { $in: userIds },
      startAt: { $lt: maxEnd },
      endAt: { $gt: minStart },
    })
      .session(session)
      .lean();

    // 5. Валідація зовнішніх конфліктів
    validateExternalOverlaps(normalized, existingShifts);

    // 6. Виконання Bulk операцій
    const bulkOps = buildBulkOperations(normalized, user._id);

    if (bulkOps.length > 0) {
      const result = await ShiftsCollection.bulkWrite(bulkOps, { session });

      const updateOpsCount = bulkOps.filter((op) => op.updateOne).length;
      if (result.matchedCount < updateOpsCount) {
        throw createHttpError(
          409,
          'Conflict: One or more shifts were modified by another user',
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
