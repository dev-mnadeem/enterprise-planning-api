import { User } from "../entities";
import { Request } from "express";

export interface RequestWithCurrentUser extends Request {
  currentUser: User
}
export interface UserQueryParams {
  pageNumber: string | undefined;
  pageSize: string | undefined;
  search: string | undefined;
  sortBy: string | undefined;
  orderBy: 'ASC' | 'DESC' | undefined;
  phoneNumber: string | undefined;
}

export const queryParamToUserParam = (req: Request): UserQueryParams => {
  const { pageNumber, pageSize, q, sortBy, orderBy, phoneNumber } = req.query;
  return {
    pageNumber: pageNumber as string | undefined,
    pageSize: pageSize as string | undefined,
    search: q as string | undefined,
    sortBy: sortBy as string | undefined,
    orderBy: orderBy as 'ASC' | 'DESC' | undefined,
    phoneNumber: phoneNumber as string | undefined,
  };
};
