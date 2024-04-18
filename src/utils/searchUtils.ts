import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export const addSearchToQuery = <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  searchParams: string,
  search: string,
): void => {
  query
    .addSelect(`ts_rank_cd(to_tsvector(${searchParams}), websearch_to_tsquery(:search))`, 'rank')
    .andWhere(`to_tsvector(${searchParams}) @@ websearch_to_tsquery(:search)`, { search })
    .setParameter('search', search)
    .orderBy('rank', 'DESC');
};
