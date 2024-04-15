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

describe('updating an order', () => {
  it('keeps the booked price and package when the PATCH does not resend them', async () => {
    const res = await api('PATCH', `/orders/${order.id}`, admin, { receiver_address: '9 Harper Road' });
    expect(res.status).toBe(200);
    expect(res.body.receiver_address).toBe('9 Harper Road');
    expect(Number(res.body.pricing.price)).toBe(45);
    expect(res.body.package.name).toBe('Small box (up to 5 kg)');
    expect(res.body.user_id).toBe(order.user_id);
  });

  it('accepts every status the schema allows, including return_in_progress', async () => {
    const res = await api('PATCH', `/orders/${order.id}`, admin, { status: 'return_in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('return_in_progress');
  });

  it('can resend the same items unchanged', async () => {
    const items = order.order_items.map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: Number(item.price),
      weight: Number(item.weight),
    }));
    const res = await api('PATCH', `/orders/${order.id}`, admin, { orderItems: items });
    expect(res.status).toBe(200);
    expect(res.body.order_items).toHaveLength(1);
  });

  it('refuses items that belong to a different order', async () => {
    const other = (await api('POST', '/orders', admin, newOrderBody(demo))).body;
    const stranger = other.order_items[0];
    const res = await api('PATCH', `/orders/${order.id}`, admin, {
      orderItems: [{ id: stranger.id, quantity: 1, weight: 1 }],
    });
    expect(res.status).toBe(422);
  });

  it('rejects a fractional or zero item quantity', async () => {
    const body = newOrderBody(demo, { orderItems: [{ name: 'Half a box', quantity: 0.5, weight: 1 }] });
    expect((await api('POST', '/orders', admin, body)).status).toBe(422);
  });
});

describe('customers created from an order', () => {
  it('cannot be signed into with the old shared default password', async () => {
    const body = newOrderBody(demo);
    await api('POST', '/orders', admin, body);
    const res = await api('POST', '/auth/login', undefined, { phone_number: body.sender_phone, password: 'Helloworld' });
    expect(res.status).toBe(401);
  });
});

describe('moving an order between branches', () => {
  let shipment: any;

  beforeAll(async () => {
    shipment = (await api('POST', '/orders', admin, newOrderBody(demo))).body;
  });

  it('reports that a freshly booked order can go out but not in', async () => {
    const asIn = await api('GET', `/orders/${shipment.order_number}/in/is-valid`, admin);
    const asOut = await api('GET', `/orders/${shipment.order_number}/out/is-valid`, admin);
    expect(asIn.body.is_valid).toBe(false);
    expect(asOut.body).toEqual({ is_valid: true });
  });

  it('refuses to check in an order that is already in', async () => {
    const res = await api('POST', '/orders/in', admin, {
      order_numbers: [shipment.order_number],
      location_id: demo.kumasiBranch.id,
    });
    expect(res.body).toEqual({ success: [], failed: [shipment.order_number] });
  });

  it('sends it out on a vehicle, once', async () => {
    const out = {
      order_numbers: [shipment.order_number, 'no-such-order'],
      from_location_id: demo.accraBranch.id,
      to_location_id: demo.kumasiBranch.id,
      vehicle_id: demo.vehicle.id,
    };
    const first = await api('POST', '/orders/out', admin, out);
    expect(first.status).toBe(200);
    expect(first.body).toEqual({ success: [shipment.order_number], failed: ['no-such-order'] });

    const second = await api('POST', '/orders/out', admin, out);
    expect(second.body.success).toEqual([]);
  });

  it('checks it in at the destination, after which it lists there', async () => {
    const res = await api('POST', '/orders/in', admin, {
      order_numbers: [shipment.order_number],
      location_id: demo.kumasiBranch.id,
    });
    expect(res.body.success).toEqual([shipment.order_number]);

    const atKumasi = await api('GET', `/orders?locationId=${demo.kumasiBranch.id}&pageSize=100`, admin);
    expect(atKumasi.body.results.map((o: any) => o.id)).toContain(shipment.id);

    const detail = await api('GET', `/orders/${shipment.id}`, admin);
    expect(detail.body.history.map((h: any) => h.status)).toEqual(['in', 'out', 'in']);
  });

  it('records no destination when none is given, instead of an arbitrary one', async () => {
    await api('POST', '/orders/out', admin, {
      order_numbers: [shipment.order_number],
      from_location_id: demo.kumasiBranch.id,
      vehicle_id: demo.vehicle.id,
    });
    const detail = await api('GET', `/orders/${shipment.id}`, admin);
    expect(detail.body.history[0]).toMatchObject({ status: 'out', to_location: null });
  });

  it('404s on an unknown location before touching any order', async () => {
    const res = await api('POST', '/orders/in', admin, {
      order_numbers: [shipment.order_number],
      location_id: 'missing',
    });
    expect(res.status).toBe(404);
  });
});
