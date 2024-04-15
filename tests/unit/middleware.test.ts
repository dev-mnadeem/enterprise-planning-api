import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { authenticateRole, authenticateRoleOrSelf, denyRoles } from '../../src/middlewares/authenticateRoleMiddleware';
import { validateZodMiddleware } from '../../src/middlewares/validateMiddleware';
import { fakeNext, fakeRequest, fakeResponse } from './http';

const asUser = (role: string | undefined, id = 'user-1', params: Record<string, string> = {}) =>
  fakeRequest({ params, currentUser: { id, user_role: role ? { name: role } : undefined } });

describe('validateZodMiddleware', () => {
  const schema = z.object({ name: z.string(), age: z.number().optional() });

  it('replaces the body with the parsed value, dropping undeclared keys', () => {
    const req = fakeRequest({ body: { name: 'Ama', role_id: 'admin', password: 'x' } });
    const next = fakeNext();
    validateZodMiddleware(schema)(req, fakeResponse(), next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.body).toEqual({ name: 'Ama' });
  });

  it('answers 422 with the Zod issues', () => {
    const res = fakeResponse();
    const next = fakeNext();
    validateZodMiddleware(schema)(fakeRequest({ body: { age: 'old' } }), res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(422);
    expect((res.body as { errors: unknown[] }).errors).toHaveLength(2);
  });
});

describe('authenticateRole', () => {
  it('lets a listed role through', () => {
    const next = fakeNext();
    authenticateRole('admin', 'manager')(asUser('manager'), fakeResponse(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it.each([['customer'], [undefined]])('refuses role %s', (role) => {
    const res = fakeResponse();
    const next = fakeNext();
    authenticateRole('admin')(asUser(role), res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });

  it('refuses a request with no current user', () => {
    const res = fakeResponse();
    authenticateRole('admin')(fakeRequest(), res, fakeNext());
    expect(res.statusCode).toBe(403);
  });
});

describe('authenticateRoleOrSelf', () => {
  it('lets a user act on their own record', () => {
    const next = fakeNext();
    authenticateRoleOrSelf('admin')(asUser('customer', 'me', { id: 'me' }), fakeResponse(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('refuses another user’s record without the role', () => {
    const res = fakeResponse();
    authenticateRoleOrSelf('admin')(asUser('customer', 'me', { id: 'someone' }), res, fakeNext());
    expect(res.statusCode).toBe(403);
  });
});

describe('denyRoles', () => {
  it('admits staff and custom roles', () => {
    for (const role of ['admin', 'driver', 'night-shift']) {
      const next = fakeNext();
      denyRoles('customer')(asUser(role), fakeResponse(), next);
      expect(next).toHaveBeenCalledOnce();
    }
  });

  it('refuses the denied role and users without a role', () => {
    for (const role of ['customer', undefined]) {
      const res = fakeResponse();
      denyRoles('customer')(asUser(role), res, fakeNext());
      expect(res.statusCode).toBe(403);
    }
  });
});
