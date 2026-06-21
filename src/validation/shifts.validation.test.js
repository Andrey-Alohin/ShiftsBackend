import Joi from 'joi';
import { describe, expect, it } from 'vitest';
import { postShiftsSchema } from './shifts';
import test from 'node:test';

const testSchema = (schema, data) => {
  const res = schema.validate(data, { abortEarly: false });
  console.log('its function', res.error);
  return !res.error ? true : false;
};

describe('Validation - shifts post (create/update/delete', () => {
  it('should return true if shema is valid', () => {
    const shiftCreate = [
      {
        operation: 'create',
        shift: {
          user: '67a21f66299b661d478e9b6a',
          actualGroupId: '67a21f66299b661d478e9b6a',
          originGroupId: '67a21f66299b661d478e9b6a',
          type: 'work',
          startAt: new Date('2025-01-01T10:00:00Z').toISOString(),
          endAt: new Date('2025-01-01T12:00:00Z').toISOString(),
        },
      },
      {
        operation: 'create',
        shift: {
          user: '67a21f66299b661d478e9b6b',
          actualGroupId: '67a21f66299b661d478e9b6a',
          originGroupId: '67a21f66299b661d478e9b6a',
          type: 'work',
          startAt: new Date('2025-01-01T00:00:00Z').toISOString(),
          endAt: new Date('2025-01-01T02:00:00Z').toISOString(),
        },
      },
    ];

    expect(testSchema(postShiftsSchema, shiftCreate)).toBe(true);
  });
  it('should return false if schema not valid', () => {
    const shiftUpdate = [
      {
        operation: 'update',
        shift: {
          user: '67a21f66299b661d478e9b6b',
          actualGroupId: '67a21f66299b661d478e9b6a',
          originGroupId: '67a21f66299b661d478e9b6a',
          type: 'work',
          startAt: new Date('2025-01-01T00:00:00Z').toISOString(),
          endAt: new Date('2025-01-01T02:00:00Z').toISOString(),
        },
      },
    ];

    expect(testSchema(postShiftsSchema, shiftUpdate)).toBe(false);
  });
});
