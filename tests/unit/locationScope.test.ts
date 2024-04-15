import { describe, expect, it } from 'vitest';

import type { User } from '../../src/entities';
import { resolveLocationScope } from '../../src/utils/locationScope';
import { canMove } from '../../src/utils/movementRules';

const user = (role: string, locationIds: string[]) =>
  ({ user_role: { name: role }, locations: locationIds.map((id) => ({ id })) }) as unknown as User;

describe('resolveLocationScope', () => {
  it('honours an explicit location for anyone', () => {
    expect(resolveLocationScope(user('employee', []), 'loc-9')).toEqual({ kind: 'locations', ids: ['loc-9'] });
  });

  it('lets an admin see every location', () => {
    expect(resolveLocationScope(user('admin', []))).toEqual({ kind: 'everywhere' });
  });

  it('limits other staff to their own locations', () => {
    expect(resolveLocationScope(user('manager', ['a', 'b']))).toEqual({ kind: 'locations', ids: ['a', 'b'] });
  });

  it('gives staff without locations an empty scope rather than everything', () => {
    expect(resolveLocationScope(user('driver', []))).toEqual({ kind: 'locations', ids: [] });
  });
});

describe('canMove', () => {
  it('allows the opposite of the last movement', () => {
    expect(canMove('in', 'out')).toBe(true);
    expect(canMove('out', 'in')).toBe(true);
  });

  it('refuses to repeat the last movement', () => {
    expect(canMove('in', 'in')).toBe(false);
    expect(canMove('out', 'out')).toBe(false);
  });

  it('refuses anything with no history', () => {
    expect(canMove(undefined, 'in')).toBe(false);
    expect(canMove(undefined, 'out')).toBe(false);
  });
});
