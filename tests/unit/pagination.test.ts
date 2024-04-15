import { describe, expect, it } from 'vitest';

import { MAX_PAGE_SIZE, buildPagination, normaliseSortOrder } from '../../src/utils/paginationUtils';

describe('buildPagination', () => {
  it('defaults to the first page of ten', () => {
    expect(buildPagination(undefined, undefined)).toEqual({ take: 10, skip: 0, pageNo: 1 });
  });

  it('turns a page number into an offset', () => {
    expect(buildPagination('3', '25')).toEqual({ take: 25, skip: 50, pageNo: 3 });
  });

  it.each([
    ['0', '10'],
    ['-2', '10'],
    ['abc', '10'],
  ])('falls back to page 1 for pageNumber=%s', (pageNumber, pageSize) => {
    expect(buildPagination(pageNumber, pageSize).pageNo).toBe(1);
  });

  it('caps the page size', () => {
    expect(buildPagination('1', '5000').take).toBe(MAX_PAGE_SIZE);
  });

  it('ignores a page size that is not a positive number', () => {
    expect(buildPagination('1', '0').take).toBe(10);
    expect(buildPagination('1', 'many').take).toBe(10);
  });
});

describe('normaliseSortOrder', () => {
  it.each([
    ['asc', 'ASC'],
    ['DESC', 'DESC'],
    ['Desc', 'DESC'],
  ])('accepts %s', (input, expected) => {
    expect(normaliseSortOrder(input)).toBe(expected);
  });

  it.each(['sideways', '', undefined, ['ASC'], 1])('drops %j', (input) => {
    expect(normaliseSortOrder(input)).toBeUndefined();
  });
});
