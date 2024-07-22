import { Request } from "express";

export interface PricingQueryParams {
  fromCityId:  string | undefined;
  toCityId:  string | undefined;
  packageId: string | undefined;
  route: 'road' | 'air' | 'sea' | undefined;
}

export const queryParamToPricingParam = (req: Request): PricingQueryParams => {
  const { fromCityId, toCityId, packageId, route } = req.query;
  return {
    fromCityId: fromCityId as string | undefined,
    toCityId: toCityId as string | undefined,
    packageId: packageId as string | undefined,
    route: route as 'road' | 'air' | 'sea' | undefined,
  };
};
