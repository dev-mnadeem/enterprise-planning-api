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

describe('unauthenticated requests', () => {
  it.each(['users', 'user-roles', 'permissions', 'vehicles', 'orders'])(
    'are rejected on /%s',
    async (path) => {
      const res = await fetch(`${BASE}/${path}`);
      expect(res.status).toBe(401);
    },
  );

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
  it.each(['users', 'user-roles', 'permissions'])(
    'cannot reach the admin surface /%s',
    async (path) => {
      const res = await fetch(`${BASE}/${path}`, { headers: json(customerToken) });
      expect(res.status).toBe(403);
    },
  );

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
});

describe('an administrator', () => {
  it.each(['users', 'user-roles', 'permissions'])('can reach /%s', async (path) => {
    const res = await fetch(`${BASE}/${path}`, { headers: json(adminToken) });
    expect(res.status).toBe(200);
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
