import { Area } from '../entities';
import { AppDataSource } from '../database/data-source';
import { CustomError } from '../utils/customError';
import { TCreateArea, TUpdateArea } from '../schemas/area.schema';

const areaRepository = AppDataSource.getRepository(Area);

export const createArea = async (areaData: TCreateArea): Promise<Area> => {
  const newArea = areaRepository.create(areaData);
  return await areaRepository.save(newArea);
};

export const getAllAreas = async (): Promise<Area[] | null> => {
  const areas = await areaRepository.find();
  return areas;
};

export const getAreaById = async (id: string): Promise<Area | undefined> => {
  const area = await areaRepository.findOneOrFail({ where: { id }, relations: { city: { state: { country: true } } } });

  if (!area) {
    throw new CustomError('Area Not Found', 404);
  }

  return area;
};

export const updateArea = async (id: string, newData: TUpdateArea): Promise<Area | null> => {
  const areaToUpdate = await areaRepository.findOneOrFail({
    where: { id },
  });

  if (!areaToUpdate) {
    throw new CustomError('Area Not Found', 404);
  }

  const updatedArea = { ...areaToUpdate, ...newData };
  return await areaRepository.save(updatedArea);
};

export const deleteArea = async (id: string): Promise<boolean> => {
  const result = await areaRepository.delete(id);
  return result.affected !== 0;
};
