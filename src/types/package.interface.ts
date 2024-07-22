import { Request } from "express";

export interface PackageQueryParams {
  route: 'road' | 'air' | 'sea' | undefined;
}

export const queryParamToPackageParam = (req: Request): PackageQueryParams => {
  const { route } = req.query;
  return {
    route: route as 'road' | 'air' | 'sea' | undefined,
  };
};
