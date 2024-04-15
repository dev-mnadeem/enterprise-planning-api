/**
 * Contract tests for the order lifecycle: booking, listing by location,
 * and moving stock out of one branch and into another.
 * Needs the stack seeded with `npm run seed:demo` as well as the admin.
 */
import { beforeAll, describe, expect, it } from 'vitest';

import { ADMIN, DemoData, api, loadDemoData, login, newOrderBody, uniquePhone } from './support/api';

let admin = '';
let demo: DemoData;
let order: any;

beforeAll(async () => {
  admin = await login(ADMIN);
  demo = await loadDemoData(admin);
  const created = await api('POST', '/orders', admin, newOrderBody(demo));
  expect(created.status).toBe(201);
  order = created.body;
}, 60_000);

describe('booking an order', () => {
  it('numbers it, prices its items and checks it in at the booking branch', () => {
    expect(order.order_number).toMatch(/^\d+$/);
    expect(Number(order.order_items[0].total_price)).toBe(40);
    expect(order.history).toHaveLength(1);
    expect(order.history[0]).toMatchObject({ status: 'in', name: 'Accra Central Branch', city: 'Accra' });
  });

  it('rejects an order with a malformed payment date', async () => {
    const res = await api('POST', '/orders', admin, newOrderBody(demo, { payment_date: 'yesterday' }));
    expect(res.status).toBe(422);
  });
});

describe('listing orders', () => {
  it('works for an admin and includes the new order', async () => {
    const res = await api('GET', `/orders?q=${order.order_number}`, admin);
    expect(res.status).toBe(200);
    expect(res.body.results.map((o: any) => o.id)).toContain(order.id);
  });

  it('filters by the branch an order currently sits at', async () => {
    const atAccra = await api('GET', `/orders?locationId=${demo.accraBranch.id}&pageSize=100`, admin);
    const atKumasi = await api('GET', `/orders?locationId=${demo.kumasiBranch.id}&pageSize=100`, admin);
    expect(atAccra.body.results.map((o: any) => o.id)).toContain(order.id);
    expect(atKumasi.body.results.map((o: any) => o.id)).not.toContain(order.id);
  });

  it('returns an empty page, not a SQL error, for staff with no locations', async () => {
    const roles = (await api<any[]>('GET', '/user-roles', admin)).body;
    const employee = roles.find((role) => role.name === 'employee');
    const phone = uniquePhone('+1555');
    await api('POST', '/users', admin, { name: 'Unplaced Clerk', phone_number: phone, role_id: employee.id });
    const clerk = await login({ phone_number: phone, password: 'Helloworld' });

    const res = await api('GET', '/orders', clerk);
    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([]);
    expect(res.body.pageInfo.totalResults).toBe(0);
  });

  it('clamps page sizes and ignores an unknown sort direction', async () => {
    const res = await api('GET', '/orders?pageSize=100000&pageNumber=-3&sortBy=created_at&orderBy=sideways', admin);
    expect(res.status).toBe(200);
    expect(res.body.pageInfo).toMatchObject({ pageNumber: 1, pageSize: 100 });
  });
});
