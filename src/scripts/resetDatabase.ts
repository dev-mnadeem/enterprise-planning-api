import { AppDataSource } from '../database/data-source';

(async function resetDatabase() {
  const excludedTables = ['country', 'state', 'city', 'user', 'user_role', 'permission', 'location_type']; // tables you want to exclude

  try {
    // Initialize the DataSource
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();

    // Fetch all table names
    const tables = await queryRunner.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`);
    const tableNames = tables.map((t: any) => t.tablename).filter((t: string) => !excludedTables.includes(t));

    // Ensure transaction is started only if there are tables to truncate
    if (tableNames.length > 0) {
      await queryRunner.startTransaction();

      // Truncate all tables except excluded ones
      for (const tableName of tableNames) {
        await queryRunner.query(`TRUNCATE TABLE "${tableName}" CASCADE;`);
      }

      await queryRunner.commitTransaction();
    }

    await queryRunner.release();
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    // Close the DataSource if it was initialized
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
})();
