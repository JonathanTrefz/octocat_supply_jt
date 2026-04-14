/**
 * Repository for cats data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Cat } from '../models/cat';
import { handleDatabaseError, NotFoundError } from '../utils/errors';
import { buildInsertSQL, buildUpdateSQL, objectToCamelCase, mapDatabaseRows, DatabaseRow } from '../utils/sql';

export class CatsRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Get all cats
   */
  async findAll(): Promise<Cat[]> {
    try {
      const rows = await this.db.all<DatabaseRow>('SELECT * FROM cats ORDER BY cat_id');
      return mapDatabaseRows<Cat>(rows);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get cat by ID
   */
  async findById(id: number): Promise<Cat | null> {
    try {
      const row = await this.db.get<DatabaseRow>('SELECT * FROM cats WHERE cat_id = ?', [id]);
      return row ? objectToCamelCase<Cat>(row) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Create a new cat
   */
  async create(cat: Omit<Cat, 'catId'>): Promise<Cat> {
    try {
      const { sql, values } = buildInsertSQL('cats', cat);
      const result = await this.db.run(sql, values);

      const createdCat = await this.findById(result.lastID || 0);
      if (!createdCat) {
        throw new Error('Failed to retrieve created cat');
      }

      return createdCat;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update cat by ID
   */
  async update(id: number, cat: Partial<Omit<Cat, 'catId'>>): Promise<Cat> {
    try {
      const { sql, values } = buildUpdateSQL('cats', cat, 'cat_id = ?');
      const result = await this.db.run(sql, [...values, id]);

      if (result.changes === 0) {
        throw new NotFoundError('Cat', id);
      }

      const updatedCat = await this.findById(id);
      if (!updatedCat) {
        throw new Error('Failed to retrieve updated cat');
      }

      return updatedCat;
    } catch (error) {
      handleDatabaseError(error, 'Cat', id);
    }
  }

  /**
   * Delete cat by ID
   */
  async delete(id: number): Promise<void> {
    try {
      const result = await this.db.run('DELETE FROM cats WHERE cat_id = ?', [id]);

      if (result.changes === 0) {
        throw new NotFoundError('Cat', id);
      }
    } catch (error) {
      handleDatabaseError(error, 'Cat', id);
    }
  }
}

// Factory function to create repository instance
export async function createCatsRepository(isTest: boolean = false): Promise<CatsRepository> {
  const db = await getDatabase(isTest);
  return new CatsRepository(db);
}

// Singleton instance for default usage
let catsRepo: CatsRepository | null = null;

export async function getCatsRepository(isTest: boolean = false): Promise<CatsRepository> {
  const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  if (isTestEnv) {
    return createCatsRepository(true);
  }
  if (!catsRepo) {
    catsRepo = await createCatsRepository(false);
  }
  return catsRepo;
}
