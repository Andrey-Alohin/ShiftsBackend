import createHttpError from 'http-errors';
import { isOverlap } from './dateUtil.js';

/**
 * Перевірка на накладення змін всередині вхідного масиву (O(n^2))
 */
export const validateInternalOverlaps = (normalized) => {
  for (let i = 0; i < normalized.length; i++) {
    const current = normalized[i];
    for (let j = i + 1; j < normalized.length; j++) {
      const other = normalized[j];
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
  //мап виглядає парою з назва параметру id користувача : значення масив змін цього користувача
  const existingMap = new Map();

  for (const shift of existingShifts) {
    const userId = shift.user.toString();
    if (!existingMap.has(userId)) existingMap.set(userId, []);
    existingMap.get(userId).push(shift);
  }

  for (const shift of normalized) {
    const userShifts = existingMap.get(shift.user.toString()) || [];
    const conflict = userShifts.find((ex) => {
      // Якщо це оновлення тієї ж самої зміни, це не конфлікт.
      // Перевіряємо, чи існують обидва _id, перш ніж їх порівнювати.
      if (shift._id && ex._id && shift._id.toString() === ex._id.toString()) {
        return false;
      }
      return isOverlap(shift.startAt, shift.endAt, ex.startAt, ex.endAt);
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
export const buildBulkOperations = (categorized, creatorId) => {
  const createOps = categorized.create.map((doc) => ({
    insertOne: {
      document: { ...doc, createdBy: creatorId },
    },
  }));

  const updateOps = categorized.update.map(
    ({ _id, version, ...updateData }) => ({
      updateOne: {
        filter: { _id, version },
        update: {
          $set: updateData,
          $inc: { version: 1 },
        },
      },
    }),
  );

  const deleteOps = categorized.delete.map(({ _id, version }) => ({
    deleteOne: {
      filter: { _id, version }, // Важливо передавати version для оптимістичного блокування
    },
  }));

  return [...createOps, ...updateOps, ...deleteOps];
};
