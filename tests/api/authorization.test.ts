/**
 * Contract tests for authentication and authorization, run against the stack
 * from docker-compose.yml:
 *
 *   docker compose up -d --build
 *   docker compose --profile tools run --rm seed
 *   npm run test:api
 *
 * Every case here corresponds to something the API actually allowed. The
 * headline one: a self-registered customer could delete the administrator.
 */
import { describe, it, expect, beforeAll } from 'vitest';

const BASE = process.env.API_BASE ?? 'http://localhost:3006/api';

const ADMIN = { email: 'admin@example.com', password: 'Helloworld' };
const CUSTOMER = {
  name: 'Contract Test Customer',
  email: `contract-${Date.now()}@example.com`,
  password: 'Helloworld1',
  phone_number: `+1999${Date.now().toString().slice(-7)}`,
};

const json = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const decodeJwt = (token: string) => {
  const raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
};

let adminToken = '';
let customerToken = '';
let adminId = '';
let customerId = '';

beforeAll(async () => {
  const login = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: json(),
    body: JSON.stringify(ADMIN),
  });
  expect(login.status, 'admin login — is the stack seeded?').toBe(200);
  adminToken = (await login.json()).token;

  await fetch(`${BASE}/auth/signup`, {
    method: 'POST',
    headers: json(),
    body: JSON.stringify(CUSTOMER),
  });
  const custLogin = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: json(),
    body: JSON.stringify({ email: CUSTOMER.email, password: CUSTOMER.password }),
  });
  expect(custLogin.status).toBe(200);
  customerToken = (await custLogin.json()).token;

  adminId = JSON.parse(decodeJwt(adminToken).id).id;
  customerId = JSON.parse(decodeJwt(customerToken).id).id;
}, 60_000);

describe('tokens', () => {
  it('expire', () => {
    const payload = decodeJwt(adminToken);
    expect(payload.exp, 'no exp claim: the token never expires').toBeDefined();
    expect(payload.exp - payload.iat).toBeLessThanOrEqual(60 * 60);
  });

  it('do not carry the password hash', () => {
    const user = JSON.parse(decodeJwt(adminToken).id);
    // A JWT payload is base64, not encrypted; anyone holding it can read this.
    expect(user).not.toHaveProperty('password');
    expect(user).not.toHaveProperty('refresh_token');
  });
});

describe('login', () => {
  const attempt = (body: object) =>
    fetch(`${BASE}/auth/login`, { method: 'POST', headers: json(), body: JSON.stringify(body) });

  it('gives the same answer for an unknown account and a wrong password', async () => {
    const unknown = await attempt({ email: 'nobody-here@example.com', password: 'Whatever123' });
    const wrong = await attempt({ email: ADMIN.email, password: 'Whatever123' });
    expect(unknown.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(await unknown.json()).toEqual(await wrong.json());
  });

  it('accepts a phone number instead of an email', async () => {
    const res = await attempt({ phone_number: CUSTOMER.phone_number, password: CUSTOMER.password });
    expect(res.status).toBe(200);
  });

  it('rejects a body with neither email nor phone number', async () => {
    const res = await attempt({ password: 'Whatever123' });
    expect(res.status).toBe(422);
  });

  it('rotates the refresh cookie and issues a new access token', async () => {
    const res = await attempt(ADMIN);
    const cookie = (res.headers.get('set-cookie') ?? '').split(';')[0];
    expect(cookie).toMatch(/^REFRESH-TOKEN=/);

    const refreshed = await fetch(`${BASE}/auth/refresh`, { headers: { Cookie: cookie } });
    expect(refreshed.status).toBe(200);
    expect((await refreshed.json()).token).toEqual(expect.any(String));

    // the old refresh token was replaced, so it cannot be replayed
    const replay = await fetch(`${BASE}/auth/refresh`, { headers: { Cookie: cookie } });
    expect(replay.status).toBe(401);
  });

  it('rejects a refresh without the cookie', async () => {
    const res = await fetch(`${BASE}/auth/refresh`);
    expect(res.status).toBe(401);
  });
});

describe('unauthenticated requests', () => {
  it.each(['users', 'user-roles', 'permissions', 'vehicles', 'orders'])('are rejected on /%s', async (path) => {
    const res = await fetch(`${BASE}/${path}`);
    expect(res.status).toBe(401);
  });

  it('are rejected when the token is malformed', async () => {
    const res = await fetch(`${BASE}/users`, { headers: json('not-a-jwt') });
    expect(res.status).toBe(403);
  });

  it('are rejected when the payload is not the JSON the middleware expects', async () => {
    // This used to throw inside an async callback with no handler, so the
    // request hung instead of being refused.
    const res = await fetch(`${BASE}/users`, {
      headers: json('eyJhbGciOiJIUzI1NiJ9.eyJpZCI6Im5vdC1qc29uIn0.x'),
    });
    expect(res.status).toBe(403);
  });
});

describe('a self-registered customer', () => {
  it.each(['users', 'user-roles', 'permissions'])('cannot reach the admin surface /%s', async (path) => {
    const res = await fetch(`${BASE}/${path}`, { headers: json(customerToken) });
    expect(res.status).toBe(403);
  });

  it.each([
    ['GET', 'orders'],
    ['GET', 'parcels'],
    ['GET', 'pricings'],
    ['GET', 'locations'],
    ['POST', 'packages'],
    ['POST', 'pricings'],
    ['DELETE', 'vehicles/any-id'],
    ['POST', 'orders/in'],
  ])('is kept out of the back office: %s /%s', async (method, path) => {
    const res = await fetch(`${BASE}/${path}`, {
      method,
      headers: json(customerToken),
      body: method === 'GET' ? undefined : '{}',
    });
    expect(res.status).toBe(403);
  });

  it('cannot read another user', async () => {
    const res = await fetch(`${BASE}/users/${adminId}`, { headers: json(customerToken) });
    expect(res.status).toBe(403);
  });

  it('cannot delete the administrator', async () => {
    const res = await fetch(`${BASE}/users/${adminId}`, {
      method: 'DELETE',
      headers: json(customerToken),
    });
    expect(res.status).toBe(403);

    // and the administrator is still able to sign in
    const stillThere = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: json(),
      body: JSON.stringify(ADMIN),
    });
    expect(stillThere.status).toBe(200);
  });

  it('can still read its own record', async () => {
    const res = await fetch(`${BASE}/users/${customerId}`, { headers: json(customerToken) });
    expect(res.status).toBe(200);
  });

  it.each([
    ['role_id', 'any-role-id'],
    ['permissions', [{ name: 'User', properties: { add: true, view: true, update: true, remove: true } }]],
    ['status', false],
    ['location_ids', []],
  ])('cannot change its own %s', async (field, value) => {
    const res = await fetch(`${BASE}/users/${customerId}`, {
      method: 'PATCH',
      headers: json(customerToken),
      body: JSON.stringify({ [field]: value }),
    });
    expect(res.status).toBe(403);
  });

  it('can change its own password, and the new one is hashed', async () => {
    const res = await fetch(`${BASE}/users/${customerId}`, {
      method: 'PATCH',
      headers: json(customerToken),
      body: JSON.stringify({ password: 'Changed-pass-2' }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).not.toHaveProperty('password');

    const relogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: json(),
      body: JSON.stringify({ email: CUSTOMER.email, password: 'Changed-pass-2' }),
    });
    expect(relogin.status).toBe(200);
  });

  it('cannot smuggle columns the schema does not declare', async () => {
    const res = await fetch(`${BASE}/users/${customerId}`, {
      method: 'PATCH',
      headers: json(customerToken),
      body: JSON.stringify({ name: 'Renamed Customer', refresh_token: 'forged', id: 'someone-else' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(customerId);
    expect(body.name).toBe('Renamed Customer');
  });
});

describe('an administrator', () => {
  it.each(['users', 'user-roles', 'permissions'])('can reach /%s', async (path) => {
    const res = await fetch(`${BASE}/${path}`, { headers: json(adminToken) });
    expect(res.status).toBe(200);
  });

  it('can move a user to another role', async () => {
    const roles = await (await fetch(`${BASE}/user-roles`, { headers: json(adminToken) })).json();
    const driver = roles.find((role: { name: string }) => role.name === 'driver');
    const phone = `+1888${Date.now().toString().slice(-7)}`;

    const created = await fetch(`${BASE}/users`, {
      method: 'POST',
      headers: json(adminToken),
      body: JSON.stringify({ name: 'Role Change', phone_number: phone, role_id: roles[0].id }),
    });
    expect(created.status).toBe(201);
    const user = await created.json();
    expect(user).not.toHaveProperty('password');

    const patched = await fetch(`${BASE}/users/${user.id}`, {
      method: 'PATCH',
      headers: json(adminToken),
      body: JSON.stringify({ role_id: driver.id }),
    });
    expect(patched.status).toBe(200);

    const reread = await (await fetch(`${BASE}/users/${user.id}`, { headers: json(adminToken) })).json();
    expect(reread.user_role.name).toBe('driver');
  });

  it('can disable an account, which locks out its existing token', async () => {
    const phone = `+1666${Date.now().toString().slice(-7)}`;
    const signup = await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: json(),
      body: JSON.stringify({ name: 'Soon Disabled', password: 'Helloworld1', phone_number: phone }),
    });
    const { token } = await signup.json();
    const id = JSON.parse(decodeJwt(token).id).id;

    const disable = await fetch(`${BASE}/users/${id}`, {
      method: 'PATCH',
      headers: json(adminToken),
      body: JSON.stringify({ status: false }),
    });
    expect(disable.status).toBe(200);

    const withOldToken = await fetch(`${BASE}/users/${id}`, { headers: json(token) });
    expect(withOldToken.status).toBe(403);

    const login = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: json(),
      body: JSON.stringify({ phone_number: phone, password: 'Helloworld1' }),
    });
    expect(login.status).toBe(403);
  });

  it('is not served password hashes or refresh tokens', async () => {
    const res = await fetch(`${BASE}/users`, { headers: json(adminToken) });
    const body = await res.json();
    expect(body.results.length).toBeGreaterThan(0);
    for (const user of body.results) {
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('refresh_token');
    }
  });
});
