import { User } from '../entities';
import { AppDataSource } from '../database/data-source';
import { addSearchToQuery } from '../utils/searchUtils';

const userRepository = AppDataSource.getRepository(User);

export const getAllUsers = async (search?: string | undefined): Promise<User[] | null> => {
  const query = userRepository.createQueryBuilder('User').select('*');

  if (search) {
    addSearchToQuery(query, `"firstName" || ' ' || "lastName"`, search);
  }

  const users = await query.getRawMany();
  return users;
};
