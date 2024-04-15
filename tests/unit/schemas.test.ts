import { describe, expect, it } from 'vitest';

import { createPackageSchema } from '../../src/schemas/package.schema';
import { findPrivilegedFields, loginSchema, updateUserSchema } from '../../src/schemas/user.schema';
import { parcelOutSchema, parcelsOutSchema } from '../../src/schemas/parcelHistory.schema';
import { parcelSchema } from '../../src/schemas/parcel.schema';
import { createContainerSchema } from '../../src/schemas/container.schema';

describe('loginSchema', () => {
  it('needs an email or a phone number', () => {
    expect(loginSchema.safeParse({ password: 'long-enough' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'long-enough' }).success).toBe(true);
    expect(loginSchema.safeParse({ phone_number: '+233200000001', password: 'long-enough' }).success).toBe(true);
  });

  it('reports a missing identifier as a validation issue rather than throwing', () => {
    expect(() => loginSchema.safeParse({ password: 'long-enough' })).not.toThrow();
  });
});

describe('updateUserSchema', () => {
  it('no longer accepts a refresh token', () => {
    const parsed = updateUserSchema.parse({ name: 'Ama', refresh_token: 'forged' });
    expect(parsed).toEqual({ name: 'Ama' });
  });

  it('flags the fields that need an admin on one’s own record', () => {
    expect(findPrivilegedFields({ name: 'Ama', password: 'new-password' })).toEqual([]);
    expect(findPrivilegedFields({ role_id: 'r', status: false, name: 'Ama' })).toEqual(['role_id', 'status']);
    expect(findPrivilegedFields({ location_ids: [] })).toEqual(['location_ids']);
  });
});

describe('createPackageSchema', () => {
  it('insists that sea packages are measured in cbm with all three dimensions', () => {
    expect(createPackageSchema.safeParse({ name: 'Pallet', route: 'sea', weight_type: 'kg' }).success).toBe(false);
    expect(
      createPackageSchema.safeParse({ name: 'Pallet', route: 'sea', weight_type: 'cbm', width: 1, height: 1 }).success,
    ).toBe(false);
    expect(
      createPackageSchema.safeParse({ name: 'Pallet', route: 'sea', weight_type: 'cbm', width: 1, height: 1, depth: 2 })
        .success,
    ).toBe(true);
  });

  it('needs a weight limit for kg or lbs packages on road and air', () => {
    expect(createPackageSchema.safeParse({ name: 'Box', route: 'air', weight_type: 'kg' }).success).toBe(false);
    expect(
      createPackageSchema.safeParse({ name: 'Box', route: 'air', weight_type: 'kg', weight_limit: 3 }).success,
    ).toBe(true);
  });
});

describe('parcel schemas', () => {
  it('wants a vehicle or a container for an outbound parcel', () => {
    expect(parcelOutSchema.safeParse({ from_location_id: 'a' }).success).toBe(false);
    expect(parcelOutSchema.safeParse({ from_location_id: 'a', container_id: 'c' }).success).toBe(true);
  });

  it('applies that rule to the bulk form as well', () => {
    expect(parcelsOutSchema.safeParse({ from_location_id: 'a', parcel_numbers: ['1'] }).success).toBe(false);
    expect(parcelsOutSchema.safeParse({ from_location_id: 'a', vehicle_id: 'v', parcel_numbers: ['1'] }).success).toBe(
      true,
    );
  });

  it('wants at least one item and a whole, positive barcode count', () => {
    expect(parcelSchema.safeParse({ location_id: 'l', parcel_data: [] }).success).toBe(false);
    expect(
      parcelSchema.safeParse({ location_id: 'l', parcel_data: [{ item_id: 'i', number_of_barcodes: 2.5 }] }).success,
    ).toBe(false);
  });
});

describe('createContainerSchema', () => {
  it('refuses the same origin and destination', () => {
    expect(createContainerSchema.safeParse({ from_country_id: 'gh', to_country_id: 'gh' }).success).toBe(false);
  });
});
