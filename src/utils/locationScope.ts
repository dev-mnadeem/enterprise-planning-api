import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import type { User } from '../entities';

export type LocationScope = { kind: 'everywhere' } | { kind: 'locations'; ids: string[] };

/**
 * Which locations a list of orders or parcels is limited to.
 * An explicit ?locationId= wins; otherwise admins see every location and
 * everyone else sees the locations assigned to them (possibly none).
 */
export const resolveLocationScope = (user: User, requestedLocationId?: string): LocationScope => {
  if (requestedLocationId) {
    return { kind: 'locations', ids: [requestedLocationId] };
  }
  if (user.user_role?.name === 'admin') {
    return { kind: 'everywhere' };
  }
  return { kind: 'locations', ids: (user.locations ?? []).map((location) => location.id) };
};

/**
 * Keep only rows whose most recent history entry is at one of the scoped
 * locations, joined as `history`. The history select then shows where each
 * item currently is rather than every stop it has made.
 */
export const whereLatestHistoryIn = <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  owner: { alias: string; historyTable: string; foreignKey: string },
  scope: LocationScope,
) => {
  const { alias, historyTable, foreignKey } = owner;

  query.andWhere(
    new Brackets((qb) => {
      qb.where(
        `history.created_at = (
          SELECT MAX("latest"."created_at") FROM "${historyTable}" "latest"
          WHERE "latest"."${foreignKey}" = "${alias}"."id"
        )`,
      );

      if (scope.kind === 'locations') {
        qb.andWhere(
          new Brackets((inner) => {
            inner
              .where("history.from_location->>'id' IN (:...scopedLocationIds)", { scopedLocationIds: scope.ids })
              .orWhere("history.to_location->>'id' IN (:...scopedLocationIds)", { scopedLocationIds: scope.ids });
          }),
        );
      }
    }),
  );
};
