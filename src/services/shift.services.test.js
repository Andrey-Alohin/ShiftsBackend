import { describe, it, expect } from 'vitest';
import { isOverlap } from '../utils/dateUtil.js';
import {
  validateInternalOverlaps,
  validateExternalOverlaps,
} from '../utils/shift.utils.js';

// Ми можемо протестувати логіку перетину, навіть не запускаючи весь сервіс
describe('Date Utility - isOverlap', () => {
  it('should return true if shifts overlap', () => {
    const aStart = new Date('2025-01-01T10:00:00Z');
    const aEnd = new Date('2025-01-01T12:00:00Z');

    const bStart = new Date('2025-01-01T11:00:00Z');
    const bEnd = new Date('2025-01-01T13:00:00Z');

    expect(isOverlap(aStart, aEnd, bStart, bEnd)).toBe(true);
  });

  it('should return false if shifts are back-to-back (no overlap)', () => {
    const aStart = new Date('2025-01-01T10:00:00Z');
    const aEnd = new Date('2025-01-01T12:00:00Z');

    const bStart = new Date('2025-01-01T12:00:00Z');
    const bEnd = new Date('2025-01-01T14:00:00Z');

    // Тут рівно 12:00 — накладення не повинно бути
    expect(isOverlap(aStart, aEnd, bStart, bEnd)).toBe(false);
  });
});

// Шаблон для тестування логіки сервісу (приклад структури)
describe('Shift Service Logic', () => {
  it('should throw 409 if shifts for the same user overlap internally', () => {
    const userId = '664c9d9f1f1f1f1f1f1f1f1f';
    const normalized = [
      {
        user: userId,
        startAt: new Date('2025-01-01T10:00Z'),
        endAt: new Date('2025-01-01T12:00Z'),
      },
      {
        user: userId,
        startAt: new Date('2025-01-01T11:00Z'),
        endAt: new Date('2025-01-01T13:00Z'),
      },
    ];

    expect(() => validateInternalOverlaps(normalized)).toThrow(
      /Internal conflict/,
    );
  });

  it('should NOT throw if shifts for different users overlap', () => {
    const normalized = [
      {
        user: 'userA',
        startAt: new Date('2025-01-01T10:00Z'),
        endAt: new Date('2025-01-01T12:00Z'),
      },
      {
        user: 'userB',
        startAt: new Date('2025-01-01T11:00Z'),
        endAt: new Date('2025-01-01T13:00Z'),
      },
    ];

    expect(() => validateInternalOverlaps(normalized)).not.toThrow();
  });

  it('should throw 409 if a new shift overlaps with an existing one in DB', () => {
    const userId = 'user123';
    const normalized = [
      {
        user: userId,
        startAt: new Date('2025-01-01T10:00Z'),
        endAt: new Date('2025-01-01T12:00Z'),
      },
    ];
    const existing = [
      {
        user: userId,
        startAt: new Date('2025-01-01T11:30Z'),
        endAt: new Date('2025-01-01T14:00Z'),
      },
    ];

    expect(() => validateExternalOverlaps(normalized, existing)).toThrow(
      /Overlap with existing record/,
    );
  });

  it('should allow updating the same shift without conflict', () => {
    const shiftId = 'shift1';
    const userId = 'user123';
    // Та сама зміна (співпадає ID)
    const normalized = [
      {
        _id: shiftId,
        user: userId,
        startAt: new Date('2025-01-01T10:00Z'),
        endAt: new Date('2025-01-01T12:00Z'),
      },
    ];
    const existing = [
      {
        _id: shiftId,
        user: userId,
        startAt: new Date('2025-01-01T10:00Z'),
        endAt: new Date('2025-01-01T12:00Z'),
      },
    ];

    expect(() => validateExternalOverlaps(normalized, existing)).not.toThrow();
  });

  it('should NOT throw if internal shifts are back-to-back (finish equals start)', () => {
    const userId = 'user123';
    const normalized = [
      {
        user: userId,
        startAt: new Date('2025-01-01T12:00:00Z'),
        endAt: new Date('2025-01-01T14:00:00Z'),
      },
      {
        user: userId,
        startAt: new Date('2025-01-01T14:00:00Z'),
        endAt: new Date('2025-01-01T16:00:00Z'),
      },
    ];

    // Оскільки 14:00 < 14:00 — це False, накладення не буде.
    // Це правильна поведінка для графіків.
    expect(() => validateInternalOverlaps(normalized)).not.toThrow();
  });
});
