const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const toPositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/** Turns ?pageNumber=&pageSize= into take/skip. Garbage falls back to defaults. */
const buildPagination = (pageNumber: string | undefined, pageSize: string | undefined) => {
  const pageNo = toPositiveInt(pageNumber, 1);
  const take = Math.min(toPositiveInt(pageSize, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  const skip = (pageNo - 1) * take;
  return { take, skip, pageNo };
};

/** TypeORM throws on anything but ASC/DESC, which surfaced as a 500. */
const normaliseSortOrder = (value: unknown): 'ASC' | 'DESC' | undefined => {
  if (typeof value !== 'string') return undefined;
  const upper = value.toUpperCase();
  return upper === 'ASC' || upper === 'DESC' ? upper : undefined;
};

export { buildPagination, normaliseSortOrder, MAX_PAGE_SIZE };
