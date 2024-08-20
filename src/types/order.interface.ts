import { Request } from "express";

export interface OrderQueryParams {
  pageNumber: string | undefined;
  pageSize: string | undefined;
  search: string | undefined;
  sortBy: string | undefined;
  orderBy: 'ASC' | 'DESC' | undefined;
  locationId: string | undefined;
}

export const queryParamToOrderParam = (req: Request): OrderQueryParams => {
  const { pageNumber, pageSize, q, sortBy, orderBy, locationId } = req.query;
  return {
    pageNumber: pageNumber as string | undefined,
    pageSize: pageSize as string | undefined,
    search: q as string | undefined,
    sortBy: sortBy as string | undefined,
    orderBy: orderBy as 'ASC' | 'DESC' | undefined,
    locationId: locationId as string | undefined,
  };
};
