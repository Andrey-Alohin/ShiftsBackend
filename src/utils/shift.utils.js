import createHttpError from 'http-errors';
import { isOverlap } from './dateUtil.js';

/**
 * Перевірка на накладення змін всередині вхідного масиву (O(n^2))
 */
export const validateInternalOverlaps = (normalized) => {
  for (let i = 0; i < normalized.length; i++) {
    const { shift: current } = normalized[i];
    for (let j = i + 1; j < normalized.length; j++) {
      const { shift: other } = normalized[j];
      if (
        current.user.toString() === other.user.toString() &&
        isOverlap(current.startAt, current.endAt, other.startAt, other.endAt)
      ) {
        throw createHttpError(
          409,
          'Internal conflict: Overlapping shifts in request',
        );
      }
    }
  }
};

/**
 * Перевірка на накладення з існуючими записами в БД (у пам'яті)
 */
export const validateExternalOverlaps = (normalized, existingShifts) => {
  const existingMap = new Map();
  for (const shift of existingShifts) {
    const userId = shift.user.toString();
    if (!existingMap.has(userId)) existingMap.set(userId, []);
    existingMap.get(userId).push(shift);
  }

  for (const current of normalized) {
    const userShifts = existingMap.get(current.user.toString()) || [];
    const conflict = userShifts.find((ex) => {
      if (current._id && current._id.toString() === ex._id.toString())
        return false;
      return isOverlap(current.startAt, current.endAt, ex.startAt, ex.endAt);
    });

    if (conflict) {
      throw createHttpError(
        409,
        `Overlap with existing record: ${conflict.startAt.toISOString()} - ${conflict.endAt.toISOString()}`,
      );
    }
  }
};

/**
 * Побудова операцій для bulkWrite
 */
export const buildBulkOperations = (normalized, creatorId) => {
  return normalized.map((current) => {
    if (current._id) {
      const { _id, version, ...updateData } = current;
      return {
        updateOne: {
          filter: { _id, version },
          update: {
            $set: updateData,
            $inc: { version: 1 },
          },
        },
      };
    }
    return {
      insertOne: {
        document: { ...current, createdBy: creatorId },
      },
    };
  });
};
