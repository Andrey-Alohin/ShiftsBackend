import { describe, expect, it } from 'vitest';
import { postShiftsSchema } from './shifts';

describe('Validation - shifts post (create/update/delete', () => {
  const cases = [
    {
      name: 'valid create|update|delete',
      input: [
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
          operation: 'update',
          shift: {
            _id: '67a21f66299b661d478e9b6b',
            version: 0,
            user: '67a21f66299b661d478e9b6a',
            actualGroupId: '67a21f66299b661d478e9b6a',
            originGroupId: '67a21f66299b661d478e9b6a',
            type: 'work',
            startAt: new Date('2025-01-01T10:00:00Z').toISOString(),
            endAt: new Date('2025-01-01T12:00:00Z').toISOString(),
          },
        },
        {
          operation: 'delete',
          shift: {
            _id: '67a21f66299b661d478e9b6b',
            version: 1,
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
            user: '67a21f66299b661d478e9b6a',
            actualGroupId: '67a21f66299b661d478e9b6a',
            originGroupId: '67a21f66299b661d478e9b6a',
            type: 'work',
            startAt: new Date('2025-01-01T10:00:00Z').toISOString(),
            endAt: new Date('2025-01-01T12:00:00Z').toISOString(),
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
            user: '67a21f66299b661d478e9b6a',
            actualGroupId: '67a21f66299b661d478e9b6a',
            originGroupId: '67a21f66299b661d478e9b6a',
            type: 'work',
            startAt: '2025-01-01 10:00:00Z',
            endAt: new Date('2025-01-01T12:00:00Z').toISOString(),
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
