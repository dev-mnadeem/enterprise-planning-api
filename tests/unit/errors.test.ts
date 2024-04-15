import { describe, expect, it } from 'vitest';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

import { CustomError } from '../../src/utils/customError';
import { sendErrorResponse } from '../../src/utils/sendErrorResponse';
import { fakeResponse } from './http';

const pgError = (code: string) =>
  new QueryFailedError('INSERT ...', [], Object.assign(new Error('duplicate key "UQ_abc"'), { code }));

describe('sendErrorResponse', () => {
  it('uses the status of a CustomError', () => {
    const res = fakeResponse();
    sendErrorResponse(new CustomError('Order Not Found!', 404), res);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Order Not Found!' });
  });

  it.each([
    ['23505', 409],
    ['23503', 422],
    ['22P02', 422],
    ['XX000', 422],
  ])('maps Postgres error %s to %i without leaking the driver message', (code, status) => {
    const res = fakeResponse();
    sendErrorResponse(pgError(code), res);
    expect(res.statusCode).toBe(status);
    expect(JSON.stringify(res.body)).not.toContain('UQ_abc');
  });

  it('answers 404 for EntityNotFoundError', () => {
    const res = fakeResponse();
    sendErrorResponse(new EntityNotFoundError('Order', { id: 'x' }), res);
    expect(res.statusCode).toBe(404);
  });

  it('hides anything unexpected behind a 500', () => {
    const res = fakeResponse();
    sendErrorResponse(new TypeError("Cannot read properties of undefined (reading 'name')"), res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: 'Internal Server Error' });
  });
});
