import { describe, it, expect } from 'vitest';
import { normalizeAndCategorizeOperations } from './normalizeOperation.js';
import { SHIFT_TYPES } from '../constants/shiftTypes.js';

describe('normalizeAndCategorizeOperations utility', () => {
  const tz = 'Europe/Kyiv';
  const mockIds = {
    user: 'user1',
    actualGroupId: 'group1',
    originGroupId: 'group2',
  };

  it('should correctly normalize a "create" work shift', () => {
    const operations = [
      {
        operation: 'create',
        shift: {
          ...mockIds,
          type: SHIFT_TYPES.WORK,
          startAt: '2025-01-01T10:00:00.000Z',
          endAt: '2025-01-01T18:00:00.000Z',
        },
      },
    ];

    const { categorized, allUserIds, allGroupIds, dataBounds } =
      normalizeAndCategorizeOperations(operations, tz);

    // Check categorization
    expect(categorized.create).toHaveLength(1);
    expect(categorized.update).toHaveLength(0);
    expect(categorized.delete).toHaveLength(0);

    // Check normalization
    const result = categorized.create[0];
    expect(result.startAt).toBeInstanceOf(Date);
    expect(result.endAt).toBeInstanceOf(Date);
    expect(result.startAt.toISOString()).toBe(operations[0].shift.startAt);
    expect(result.endAt.toISOString()).toBe(operations[0].shift.endAt);

    // Check collected IDs
    expect(allUserIds).toEqual(['user1']);
    expect(allGroupIds).toEqual(['group1', 'group2']);

    // Check data bounds
    expect(dataBounds.minStartDate.toISOString()).toBe(
      operations[0].shift.startAt,
    );
    expect(dataBounds.maxEndDate.toISOString()).toBe(operations[0].shift.endAt);
  });

  it('should correctly calculate full day range for a "day_off" shift', () => {
    const operations = [
      {
        operation: 'update',
        shift: {
          ...mockIds,
          type: SHIFT_TYPES.DAY_OFF,
          startAt: '2025-01-01T12:00:00Z', // Mid-day, should be adjusted to full day
        },
      },
    ];

    const { categorized } = normalizeAndCategorizeOperations(operations, tz);

    expect(categorized.update).toHaveLength(1);
    const result = categorized.update[0];

    // For Europe/Kyiv (GMT+2 in winter), 2025-01-01 00:00 is 2024-12-31 22:00 UTC
    expect(result.startAt.toISOString()).toBe('2024-12-31T22:00:00.000Z');
    // And 2025-01-02 00:00 is 2025-01-01 22:00 UTC
    expect(result.endAt.toISOString()).toBe('2025-01-01T22:00:00.000Z');
  });

  it('should correctly calculate full day range for a "sick_leave" shift', () => {
    const operations = [
      {
        operation: 'create',
        shift: {
          ...mockIds,
          type: SHIFT_TYPES.SICK_LEAVE,
          startAt: '2025-01-01T15:00:00Z', // Time should be ignored
        },
      },
    ];

    const { categorized } = normalizeAndCategorizeOperations(operations, tz);

    expect(categorized.create).toHaveLength(1);
    const result = categorized.create[0];

    // For Europe/Kyiv (GMT+2 in winter), 2025-01-01 00:00 is 2024-12-31 22:00 UTC
    expect(result.startAt.toISOString()).toBe('2024-12-31T22:00:00.000Z');
    // And 2025-01-02 00:00 is 2025-01-01 22:00 UTC
    expect(result.endAt.toISOString()).toBe('2025-01-01T22:00:00.000Z');
  });

  it('should correctly calculate full day range for a "vacation" shift', () => {
    const operations = [
      {
        operation: 'update',
        shift: {
          ...mockIds,
          type: SHIFT_TYPES.VACATION,
          startAt: '2025-01-01T08:00:00Z', // Time should be ignored
        },
      },
    ];

    const { categorized } = normalizeAndCategorizeOperations(operations, tz);

    expect(categorized.update).toHaveLength(1);
    const result = categorized.update[0];

    expect(result.startAt.toISOString()).toBe('2024-12-31T22:00:00.000Z');
    expect(result.endAt.toISOString()).toBe('2025-01-01T22:00:00.000Z');
  });

  it('should not require endAt for "day_off" shifts', () => {
    const operations = [
      {
        operation: 'create',
        shift: {
          ...mockIds,
          type: SHIFT_TYPES.DAY_OFF,
          startAt: '2025-01-01T12:00:00Z',
          // endAt is intentionally missing
        },
      },
    ];

    const { categorized } = normalizeAndCategorizeOperations(operations, tz);
    const result = categorized.create[0];

    expect(categorized.create).toHaveLength(1);
    // Check that it still correctly calculated the full day
    expect(result.startAt.toISOString()).toBe('2024-12-31T22:00:00.000Z');
    expect(result.endAt.toISOString()).toBe('2025-01-01T22:00:00.000Z');
  });

  it('should handle DST change correctly for "day_off"', () => {
    const operations = [
      {
        operation: 'create',
        shift: {
          ...mockIds,
          type: SHIFT_TYPES.DAY_OFF,
          startAt: '2025-03-30T12:00:00Z', // Day of DST spring forward in Ukraine
        },
      },
    ];

    const { categorized } = normalizeAndCategorizeOperations(operations, tz);
    const result = categorized.create[0];

    // Start of day 2025-03-30 in Kyiv is 2025-03-29 22:00 UTC (GMT+2)
    expect(result.startAt.toISOString()).toBe('2025-03-29T22:00:00.000Z');
    // End of day 2025-03-30 in Kyiv is 2025-03-30 21:00 UTC (GMT+3)
    expect(result.endAt.toISOString()).toBe('2025-03-30T21:00:00.000Z');
  });

  it('should categorize "delete" operations without normalization', () => {
    const deleteOp = {
      operation: 'delete',
      shift: { _id: 'shiftId1', version: 1 },
    };
    const operations = [deleteOp];

    const { categorized } = normalizeAndCategorizeOperations(operations, tz);

    expect(categorized.delete).toHaveLength(1);
    expect(categorized.delete[0]).toEqual(deleteOp.shift);
    expect(categorized.create).toHaveLength(0);
    expect(categorized.update).toHaveLength(0);

    // Ensure delete ops don't affect other results
    const { allUserIds, allGroupIds, dataBounds } =
      normalizeAndCategorizeOperations(operations, tz);
    expect(allUserIds).toHaveLength(0);
    expect(allGroupIds).toHaveLength(0);
    expect(dataBounds.minStartDate).toBeNull();
  });

  it('should throw an error if date string is not in UTC format (no Z)', () => {
    const operations = [
      {
        operation: 'create',
        shift: {
          ...mockIds,
          type: SHIFT_TYPES.WORK,
          startAt: '2025-01-01T10:00:00', // Missing 'Z'
          endAt: '2025-01-01T18:00:00.000Z',
        },
      },
    ];

    expect(() => normalizeAndCategorizeOperations(operations, tz)).toThrow(
      'Date must be UTC ISO string',
    );
  });

  it('should throw an error if endAt is before startAt', () => {
    const operations = [
      {
        operation: 'create',
        shift: {
          ...mockIds,
          type: SHIFT_TYPES.WORK,
          startAt: '2025-01-01T18:00:00.000Z',
          endAt: '2025-01-01T10:00:00.000Z', // end is before start
        },
      },
    ];

    expect(() => normalizeAndCategorizeOperations(operations, tz)).toThrow(
      'startAt must be less than endAt',
    );
  });

  it('should handle an empty array of operations gracefully', () => {
    const { categorized, allUserIds, allGroupIds, dataBounds } =
      normalizeAndCategorizeOperations([], tz);

    expect(categorized.create).toHaveLength(0);
    expect(categorized.update).toHaveLength(0);
    expect(categorized.delete).toHaveLength(0);
    expect(allUserIds).toHaveLength(0);
    expect(allGroupIds).toHaveLength(0);
    expect(dataBounds.minStartDate).toBeNull();
    expect(dataBounds.maxEndDate).toBeNull();
  });

  it('should correctly process a mixed batch of operations', () => {
    const operations = [
      // Create
      {
        operation: 'create',
        shift: {
          user: 'user1',
          actualGroupId: 'group1',
          originGroupId: 'group2',
          type: SHIFT_TYPES.WORK,
          startAt: '2025-02-01T08:00:00.000Z', // Earliest start
          endAt: '2025-02-01T16:00:00.000Z',
        },
      },
      // Update
      {
        operation: 'update',
        shift: {
          _id: 'shiftIdToUpdate',
          version: 2,
          user: 'user2',
          actualGroupId: 'group3',
          originGroupId: 'group1', // Duplicate group ID
          type: SHIFT_TYPES.WORK,
          startAt: '2025-02-01T10:00:00.000Z',
          endAt: '2025-02-01T20:00:00.000Z', // Latest end
        },
      },
      // Delete
      {
        operation: 'delete',
        shift: { _id: 'shiftIdToDelete', version: 1 },
      },
      // Unknown operation (should be ignored)
      {
        operation: 'unknown',
        shift: { user: 'user3' },
      },
    ];

    const { categorized, allUserIds, allGroupIds, dataBounds } =
      normalizeAndCategorizeOperations(operations, tz);

    // Check categorization
    expect(categorized.create).toHaveLength(1);
    expect(categorized.update).toHaveLength(1);
    expect(categorized.delete).toHaveLength(1);

    // Check unique ID collection
    expect(allUserIds).toHaveLength(2);
    expect(allUserIds).toEqual(expect.arrayContaining(['user1', 'user2']));

    expect(allGroupIds).toHaveLength(3);
    expect(allGroupIds).toEqual(
      expect.arrayContaining(['group1', 'group2', 'group3']),
    );

    // Check overall data bounds
    expect(dataBounds.minStartDate.toISOString()).toBe(
      '2025-02-01T08:00:00.000Z',
    );
    expect(dataBounds.maxEndDate.toISOString()).toBe(
      '2025-02-01T20:00:00.000Z',
    );
  });
});
