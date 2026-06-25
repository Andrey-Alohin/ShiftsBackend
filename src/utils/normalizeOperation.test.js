import { describe, it, expect } from 'vitest';
import { normalizeShift } from './normalizeShift.js';

describe('normalizeShift utility', () => {
  const tz = 'Europe/Kyiv';

  it('should correctly normalize a work shift (convert strings to Dates)', () => {
    // 1. Arrange
    const dto = {
      type: 'work',
      startAt: '2025-01-01T10:00:00.000Z',
      endAt: '2025-01-01T18:00:00.000Z',
    };

    // 2. Act
    const result = normalizeShift(dto, tz);

    // 3. Assert
    expect(result.startAt).toBeInstanceOf(Date);
    expect(result.endAt).toBeInstanceOf(Date);
    expect(result.startAt.toISOString()).toBe(dto.startAt);
  });

  it('should correctly calculate full day range for day_off', () => {
    // Arrange
    const dto = {
      type: 'day_off',
      startAt: '2025-01-01T12:00:00Z', // Надіслано обід, але має стати початком дня
      endAt: '2025-01-01T13:00:00Z',
    };

    // Act
    const result = normalizeShift(dto, tz);

    // Assert
    // В Україні 2025-01-01 00:00 - це 2024-12-31 22:00 UTC
    expect(result.startAt.toISOString()).toBe('2024-12-31T22:00:00.000Z');
    expect(result.endAt.toISOString()).toBe('2025-01-01T22:00:00.000Z');
  });

  it('should throw an error if date string does not end with Z', () => {
    const dto = {
      type: 'work',
      startAt: '2025-01-01T10:00:00', // Немає Z в кінці
      endAt: '2025-01-01T18:00:00Z',
    };

    // Коли ми очікуємо помилку, ми загортаємо виклик у функцію
    expect(() => normalizeShift(dto, tz)).toThrow(
      'Date must be UTC ISO string',
    );
  });
  it('should throw an error if endAt is before startAt', () => {
    const dto = {
      type: 'work',
      startAt: '2025-01-01T18:00:00Z',
      endAt: '2025-01-01T10:00:00Z', // Кінець раніше початку
    };

    expect(() => normalizeShift(dto, tz)).toThrow(
      'startAt must be less than endAt',
    );
  });
  it('should correctly display the normalized shift for day_off in day changes of summer time', () => {
    const dto = {
      type: 'day_off',
      startAt: '2025-03-30T12:00:00Z',
      endAt: '2025-03-30T13:00:00Z',
    };

    const result = normalizeShift(dto, tz);

    expect(result.startAt.toISOString()).toBe('2025-03-29T22:00:00.000Z');
    expect(result.endAt.toISOString()).toBe('2025-03-30T21:00:00.000Z');
  });
});
