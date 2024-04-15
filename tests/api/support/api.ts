/**
 * Helpers for the API contract tests. They talk to a running, seeded stack
 * (docker compose up + the seed profile), never to the database directly.
 */
export const BASE = process.env.API_BASE ?? 'http://localhost:3006/api';

export const ADMIN = { email: 'admin@example.com', password: 'Helloworld' };

export const headers = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const api = async <T = any>(
  method: string,
  path: string,
  token?: string,
  body?: unknown,
): Promise<{ status: number; body: T }> => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(token),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: (text ? JSON.parse(text) : undefined) as T };
};

export const login = async (credentials: object): Promise<string> => {
  const { status, body } = await api<{ token: string }>('POST', '/auth/login', undefined, credentials);
  if (status !== 200) throw new Error(`login failed with ${status}: is the stack seeded?`);
  return body.token;
};

/** A phone number that will not collide with earlier runs against the same database. */
export const uniquePhone = (prefix: string) =>
  `${prefix}${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`;

export interface DemoData {
  ghana: { id: string };
  nigeria: { id: string };
  accra: { id: string };
  kumasi: { id: string };
  accraBranch: { id: string };
  kumasiBranch: { id: string };
  vehicle: { id: string };
  smallBox: { id: string };
}

/** Looks up the rows created by `npm run seed:demo`. */
export const loadDemoData = async (token: string): Promise<DemoData> => {
  const countries = (await api<any[]>('GET', '/countries', token)).body;
  const ghana = countries.find((country) => country.code === 'GH');
  if (!ghana) throw new Error('demo data missing: run `npm run seed:demo`');

  const states = (await api<any[]>('GET', `/countries/${ghana.id}/states`, token)).body;
  const cityIn = async (stateCode: string, name: string) => {
    const state = states.find((s) => s.code === stateCode);
    const cities = (await api<any[]>('GET', `/states/${state.id}/cities`, token)).body;
    return cities.find((city) => city.name === name);
  };

  const locations = (await api<any[]>('GET', '/locations', token)).body;
  const locationNamed = (name: string) => locations.find((location) => location.name === name);
  const vehicles = (await api<any[]>('GET', '/vehicles', token)).body;
  const packages = (await api<any[]>('GET', '/packages', token)).body;

  return {
    ghana,
    nigeria: countries.find((country) => country.code === 'NG'),
    accra: await cityIn('AA', 'Accra'),
    kumasi: await cityIn('AH', 'Kumasi'),
    accraBranch: locationNamed('Accra Central Branch'),
    kumasiBranch: locationNamed('Kumasi Branch'),
    vehicle: vehicles.find((vehicle) => vehicle.registration_number === 'GR 1024-24'),
    smallBox: packages.find((pkg) => pkg.name === 'Small box (up to 5 kg)'),
  };
};

export const newOrderBody = (demo: DemoData, overrides: Record<string, unknown> = {}) => ({
  sender_name: 'Ama Sender',
  sender_phone: uniquePhone('+23324'),
  sender_address: '12 Ring Road',
  sender_city_id: demo.accra.id,
  receiver_name: 'Yaw Receiver',
  receiver_phone: uniquePhone('+23327'),
  receiver_address: '4 Prempeh Street',
  receiver_city_id: demo.kumasi.id,
  total_quantity: 4,
  sub_total: 40,
  discount: 0,
  total_amount: 85,
  payment_type: 'cash',
  payment_status: 'paid',
  payment_date: new Date().toISOString(),
  weight_type: 'kg',
  total_weight: 6,
  location_id: demo.accraBranch.id,
  package_id: demo.smallBox.id,
  pricing: { from_city_id: demo.accra.id, to_city_id: demo.kumasi.id, package_id: demo.smallBox.id, price: 45 },
  orderItems: [{ name: 'Kente cloth', quantity: 4, price: 10, weight: 1.5 }],
  ...overrides,
});
