import { describe, expect, it } from 'vitest';
import { postShiftsSchema } from './shifts';
import { SHIFT_TYPES } from '../constants/shiftTypes.js';

describe('Validation - shifts post (create/update/delete', () => {
  const validCreateShift = {
    user: '67a21f66299b661d478e9b6a',
    actualGroupId: '67a21f66299b661d478e9b6a',
    originGroupId: '67a21f66299b661d478e9b6a',
    type: SHIFT_TYPES.WORK,
    startAt: new Date('2025-01-01T10:00:00Z').toISOString(),
    endAt: new Date('2025-01-01T12:00:00Z').toISOString(),
  };
  const validDeleteShift = {
    _id: '67a21f66299b661d478e9b6b',
    version: 1,
  };
  const validUpdateShift = {
    ...validCreateShift,
    ...validDeleteShift,
  };

  const cases = [
    {
      name: 'valid create',
      input: [
        {
          operation: 'create',
          shift: {
            ...validCreateShift,
          },
        },
      ],
      shouldPass: true,
    },
    {
      name: 'valid update',
      input: [
        {
          operation: 'update',
          shift: {
            ...validUpdateShift,
          },
        },
      ],
      shouldPass: true,
    },
    {
      name: 'valid delete',
      input: [
        {
          operation: 'delete',
          shift: {
            ...validDeleteShift,
          },
        },
      ],
      shouldPass: true,
    },
    {
      name: 'valid combined create/update/delete',
      input: [
        {
          operation: 'create',
          shift: {
            ...validCreateShift,
          },
        },
        {
          operation: 'update',
          shift: {
            ...validUpdateShift,
          },
        },
        {
          operation: 'delete',
          shift: {
            ...validDeleteShift,
          },
        },
      ],
      shouldPass: true,
    },
    {
      name: 'create with milliseconds (.000Z)',
      input: [
        {
          operation: 'create',
          shift: {
            ...validCreateShift,
            startAt: '2025-01-01T10:00:00.000Z',
            endAt: '2025-01-01T11:00:00.000Z',
          },
        },
      ],
      shouldPass: true,
    },
    {
      name: 'create without milliseconds (Z)',
      input: [
        {
          operation: 'create',
          shift: {
            ...validCreateShift,
            startAt: '2025-01-01T10:00:00Z',
            endAt: '2025-01-01T11:00:00Z',
          },
        },
      ],
      shouldPass: true,
    },
    {
      name: 'valid create day_off without endAt',
      input: [
        {
          operation: 'create',
          shift: {
            user: '67a21f66299b661d478e9b6a',
            actualGroupId: '67a21f66299b661d478e9b6a',
            originGroupId: '67a21f66299b661d478e9b6a',
            type: SHIFT_TYPES.DAY_OFF,
            startAt: '2025-01-01T10:00:00Z',
          },
        },
      ],
      shouldPass: true,
    },
    {
      name: 'invalid create work without endAt',
      input: [
        {
          operation: 'create',
          shift: {
            user: '67a21f66299b661d478e9b6a',
            actualGroupId: '67a21f66299b661d478e9b6a',
            originGroupId: '67a21f66299b661d478e9b6a',
            type: SHIFT_TYPES.WORK,
            startAt: '2025-01-01T10:00:00Z',
          },
        },
      ],
      shouldPass: false,
    },
    {
      name: 'invalid create work with endAt before startAt',
      input: [
        {
          operation: 'create',
          shift: {
            ...validCreateShift,
            type: SHIFT_TYPES.WORK,
            endAt: '2025-01-01T09:00:00Z',
          },
        },
      ],
      shouldPass: false,
    },
    {
      name: 'invalid operation',
      input: [
        {
          operation: 'save',
          shift: {
            ...validCreateShift,
          },
        },
      ],
      shouldPass: false,
    },
    {
      name: 'missing operation field',
      input: [
        {
          shift: {
            ...validCreateShift,
          },
        },
      ],
      shouldPass: false,
    },
    {
      name: 'operation = null',
      input: [
        {
          operation: null,
          shift: {
            ...validCreateShift,
          },
        },
      ],
      shouldPass: false,
    },
    {
      name: 'operation = empty string',
      input: [
        {
          operation: '',
          shift: {
            ...validCreateShift,
          },
        },
      ],
      shouldPass: false,
    },
    {
      name: 'invalid shift object',
      input: [
        {
          operation: 'delete',
          shift: {
            version: 1,
            id: 123,
          },
        },
      ],
      shouldPass: false,
    },
    {
      name: 'invalid date - not ISO',
      input: [
        {
          operation: 'create',
          shift: {
            ...validCreateShift,
            startAt: '2025-01-01T10:00:00+2:00',
          },
        },
      ],
      shouldPass: false,
    },
  ];
  it.each(cases)(`$name`, ({ input, shouldPass }) => {
    const { error } = postShiftsSchema.validate(input, {
      abortEarly: false,
      convert: false,
    });
    shouldPass ? expect(error).toBeUndefined() : expect(error).toBeDefined();
  });
});
