/**
 * Contract tests for splitting an order into barcoded parcels and moving
 * those parcels by vehicle or container. Needs the demo seed.
 */
import { beforeAll, describe, expect, it } from 'vitest';

import { ADMIN, DemoData, api, loadDemoData, login, newOrderBody } from './support/api';

let admin = '';
let demo: DemoData;
let item: any;

const newOrderItem = async (quantity: number) => {
  const body = newOrderBody(demo, { orderItems: [{ name: 'Cocoa sacks', quantity, price: 5, weight: 2 }] });
  const order = (await api('POST', '/orders', admin, body)).body;
  return order.order_items[0];
};

beforeAll(async () => {
  admin = await login(ADMIN);
  demo = await loadDemoData(admin);
  item = await newOrderItem(10);
}, 60_000);

describe('creating parcels', () => {
  it('splits an item evenly and puts the remainder in the last parcel', async () => {
    const res = await api('POST', '/parcels', admin, {
      location_id: demo.accraBranch.id,
      parcel_data: [{ item_id: item.id, number_of_barcodes: 3 }],
    });
    expect(res.status).toBe(201);
    expect(res.body.map((parcel: any) => parcel.parcel_items[0].quantity)).toEqual([3, 3, 4]);
    expect(new Set(res.body.map((parcel: any) => parcel.parcel_number)).size).toBe(3);
  });

  it.each([0, 1.5, 11])('rejects %s barcodes for ten units', async (barcodes) => {
    const res = await api('POST', '/parcels', admin, {
      location_id: demo.accraBranch.id,
      parcel_data: [{ item_id: item.id, number_of_barcodes: barcodes }],
    });
    expect(res.status).toBe(422);
  });

  it('creates nothing when one entry in the batch is bad', async () => {
    const other = await newOrderItem(2);
    const res = await api('POST', '/parcels', admin, {
      location_id: demo.accraBranch.id,
      parcel_data: [
        { item_id: other.id, number_of_barcodes: 2 },
        { item_id: 'missing-item', number_of_barcodes: 1 },
      ],
    });
    expect(res.status).toBe(404);

    const order = (await api('GET', `/orders/${other.order_id}`, admin)).body;
    expect(order.parcels).toEqual([]);
  });

  it('pages the parcel list', async () => {
    const res = await api('GET', '/parcels?pageSize=2', admin);
    expect(res.status).toBe(200);
    expect(res.body.results.length).toBeLessThanOrEqual(2);
    expect(res.body.pageInfo.totalResults).toBeGreaterThanOrEqual(3);
  });
});

describe('moving parcels', () => {
  let parcels: any[];

  beforeAll(async () => {
    const single = await newOrderItem(2);
    parcels = (
      await api('POST', '/parcels', admin, {
        location_id: demo.accraBranch.id,
        parcel_data: [{ item_id: single.id, number_of_barcodes: 2 }],
      })
    ).body;
  });

  it('reports the weight of a parcel that is ready to go out', async () => {
    const res = await api('GET', `/parcels/${parcels[0].parcel_number}/out/is-valid`, admin);
    expect(res.body).toEqual({ is_valid: true, parcel_data: { weight: 2, weight_type: 'kg' } });
  });

  it('needs a vehicle or a container to go out', async () => {
    const res = await api('POST', '/parcels/out', admin, {
      parcel_numbers: [parcels[0].parcel_number],
      from_location_id: demo.accraBranch.id,
    });
    expect(res.status).toBe(422);
  });

  it('loads parcels into a container and finds them by its tracking number', async () => {
    const container = await api('POST', '/containers', admin, {
      from_country_id: demo.ghana.id,
      to_country_id: demo.nigeria.id,
      volume: 33,
      volume_unit: 'cbm',
    });
    expect(container.status).toBe(201);

    const numbers = parcels.map((parcel) => parcel.parcel_number);
    const out = await api('POST', '/parcels/out', admin, {
      parcel_numbers: numbers,
      from_location_id: demo.accraBranch.id,
      container_id: container.body.id,
    });
    expect(out.body).toEqual({ success: numbers, failed: [] });

    const again = await api('POST', '/parcels/out', admin, {
      parcel_numbers: numbers,
      from_location_id: demo.accraBranch.id,
      vehicle_id: demo.vehicle.id,
    });
    expect(again.body.failed).toEqual(numbers);

    const tracked = await api('GET', `/containers/track/${container.body.tracking_number}`, admin);
    expect(tracked.status).toBe(200);
    expect(tracked.body.map((parcel: any) => parcel.parcel_number).sort()).toEqual([...numbers].sort());
  });

  it('checks a parcel back in at another branch', async () => {
    const res = await api('POST', '/parcels/in', admin, {
      parcel_numbers: [parcels[0].parcel_number],
      location_id: demo.kumasiBranch.id,
    });
    expect(res.body.success).toEqual([parcels[0].parcel_number]);

    const atKumasi = await api('GET', `/parcels?locationId=${demo.kumasiBranch.id}&pageSize=100`, admin);
    expect(atKumasi.body.results.map((p: any) => p.id)).toContain(parcels[0].id);
  });

  it('answers 404 for an unknown container', async () => {
    const res = await api('POST', '/parcels/out', admin, {
      parcel_numbers: [parcels[1].parcel_number],
      from_location_id: demo.accraBranch.id,
      container_id: 'missing',
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Container Not Found!');
  });
});
