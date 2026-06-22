import { describe, expect, it } from 'vitest';
import { postShiftsSchema } from './shifts';

describe('Validation - shifts post (create/update/delete', () => {
  const validCreateShift = {
    user: '67a21f66299b661d478e9b6a',
    actualGroupId: '67a21f66299b661d478e9b6a',
    originGroupId: '67a21f66299b661d478e9b6a',
    type: 'work',
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
      name: 'valid create|update|delete',
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
