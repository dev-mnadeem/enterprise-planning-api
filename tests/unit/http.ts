import type { NextFunction, Request, Response } from 'express';
import { vi } from 'vitest';

type FakeResponse = Response & { body: unknown };

/** Just enough of Express's req/res to drive a middleware or error mapper. */
export const fakeResponse = (): FakeResponse => {
  const res: { statusCode: number; body: unknown; status?: unknown; json?: unknown } = {
    statusCode: 200,
    body: undefined,
  };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((payload: unknown) => {
    res.body = payload;
    return res;
  });
  return res as unknown as FakeResponse;
};

export const fakeRequest = (fields: Record<string, unknown> = {}) =>
  ({ params: {}, query: {}, body: {}, ...fields }) as unknown as Request;

export const fakeNext = () => vi.fn() as unknown as NextFunction & ReturnType<typeof vi.fn>;
