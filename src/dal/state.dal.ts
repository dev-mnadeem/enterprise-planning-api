import { State } from '../entities';
import { AppDataSource } from '../database/data-source';
import { CustomError } from '../utils/customError';
import { TUpdateState } from '../schemas/state.schema';

const stateRepository = AppDataSource.getRepository(State);

export const getAllStates = async (): Promise<State[] | null> => {
  const countries = await stateRepository.find({ relations: { country: true } });
  return countries;
};

export const getStateById = async (id: string): Promise<State | undefined> => {
  const state = await stateRepository.findOne({ where: { id }, relations: { country: true } });

  if (!state) {
    throw new CustomError('State Not Found!', 404);
  }

  return state;
};

export const getStatesByCountryId = async (country_id: string): Promise<State[] | undefined> => {
  const states = await stateRepository.find({ where: { country_id } });

  return states;
};


export const updateState = async (id: string, newData: TUpdateState): Promise<State | null> => {
  const stateToUpdate = await stateRepository.findOne({
    where: { id },
  });

  if (!stateToUpdate) {
    throw new CustomError('State Not Found!', 404);
  }

  const updatedState = { ...stateToUpdate, ...newData };
  return await stateRepository.save(updatedState);
};
