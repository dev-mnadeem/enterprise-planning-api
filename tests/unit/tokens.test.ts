import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';

import { generateAccessToken, generateRefreshToken } from '../../src/utils/generateToken';
import { extractTokenWithBearerPrefix } from '../../src/utils/extractTokenWithBearerPrefix';
import { generateShipmentNumber } from '../../src/utils/shipmentNumber';

const user = { id: '01JDEMO', name: 'Ama', email: 'ama@example.com', phone_number: '+233200000009' };

describe('access tokens', () => {
  it('expire after fifteen minutes and carry the user as JSON', () => {
    const payload = jwt.verify(generateAccessToken(user), process.env.JWT_SECRET_KEY!) as jwt.JwtPayload;
    expect(payload.exp! - payload.iat!).toBe(15 * 60);
    expect(JSON.parse(payload.id)).toEqual(user);
  });

  it('are not valid as refresh tokens', () => {
    expect(() => jwt.verify(generateAccessToken(user), process.env.REFRESH_TOKEN_SECRET_KEY!)).toThrow();
  });
});

describe('refresh tokens', () => {
  it('last a day', () => {
    const payload = jwt.verify(generateRefreshToken(user), process.env.REFRESH_TOKEN_SECRET_KEY!) as jwt.JwtPayload;
    expect(payload.exp! - payload.iat!).toBe(24 * 60 * 60);
  });

  it('are unique even when issued in the same second', () => {
    expect(generateRefreshToken(user)).not.toBe(generateRefreshToken(user));
  });
});

describe('extractTokenWithBearerPrefix', () => {
  it('strips the Bearer prefix', () => {
    expect(extractTokenWithBearerPrefix('Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  it('passes a bare token through', () => {
    expect(extractTokenWithBearerPrefix('abc.def.ghi')).toBe('abc.def.ghi');
  });
});

describe('generateShipmentNumber', () => {
  it('is always 19 digits', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateShipmentNumber()).toMatch(/^\d{19}$/);
    }
  });
});
