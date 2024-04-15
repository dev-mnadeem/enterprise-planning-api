/**
 * Contract tests for vehicles and containers. Needs the demo seed.
 */
import { beforeAll, describe, expect, it } from 'vitest';

import { ADMIN, DemoData, api, loadDemoData, login } from './support/api';

let admin = '';
let demo: DemoData;
let vanTypeId = '';

beforeAll(async () => {
  admin = await login(ADMIN);
  demo = await loadDemoData(admin);
  const types = (await api<any[]>('GET', '/vehicle-types', admin)).body;
  vanTypeId = types.find((type) => type.name === 'van').id;
}, 60_000);

describe('vehicles', () => {
  it('can be registered without a driver and get a tracking number', async () => {
    const res = await api('POST', '/vehicles', admin, {
      name: 'Spare van',
      model: 'Nissan NV200',
      registration_number: `GT ${Date.now().toString().slice(-4)}-24`,
      vehicle_type_id: vanTypeId,
    });
    expect(res.status).toBe(201);
    expect(res.body.tracking_number).toMatch(/^\d+$/);
    expect(res.body.driver_id ?? null).toBeNull();
  });

  it('only accepts a user with the driver role as driver', async () => {
    const drivers = (await api<any>('GET', '/users?role=driver', admin)).body.results;
    expect(drivers.length).toBeGreaterThan(0);

    const me = JSON.parse(JSON.parse(Buffer.from(admin.split('.')[1], 'base64').toString()).id);
    const res = await api('POST', '/vehicles', admin, {
      name: 'Wrong driver',
      model: 'Any',
      registration_number: 'GX 1-24',
      vehicle_type_id: vanTypeId,
      driver_id: me.id,
    });
    expect(res.status).toBe(404);
  });

  it('can be deleted, after which it is gone from the list', async () => {
    const created = await api('POST', '/vehicles', admin, {
      name: 'Retired van',
      model: 'Old',
      registration_number: 'GR 0000-01',
      vehicle_type_id: vanTypeId,
    });
    const removed = await api('DELETE', `/vehicles/${created.body.id}`, admin);
    expect(removed.status).toBe(200);

    const list = (await api<any[]>('GET', '/vehicles', admin)).body;
    expect(list.map((vehicle) => vehicle.id)).not.toContain(created.body.id);
    expect((await api('GET', `/vehicles/${created.body.id}`, admin)).status).toBe(404);
  });
});

describe('containers', () => {
  it('refuse the same origin and destination country', async () => {
    const res = await api('POST', '/containers', admin, {
      from_country_id: demo.ghana.id,
      to_country_id: demo.ghana.id,
    });
    expect(res.status).toBe(422);
  });

  it('can be deleted', async () => {
    const created = await api('POST', '/containers', admin, {
      from_country_id: demo.ghana.id,
      to_country_id: demo.nigeria.id,
    });
    expect(created.status).toBe(201);
    expect((await api('DELETE', `/containers/${created.body.id}`, admin)).status).toBe(200);
    expect((await api('GET', `/containers/${created.body.id}`, admin)).status).toBe(404);
  });
});
