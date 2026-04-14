import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CatsRepository } from './catsRepo';
import { NotFoundError } from '../utils/errors';

// Mock the getDatabase function
vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

import { getDatabase } from '../db/sqlite';

describe('CatsRepository', () => {
  let repository: CatsRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };

    (getDatabase as any).mockResolvedValue(mockDb);
    repository = new CatsRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all cats', async () => {
      const mockResults = [
        {
          cat_id: 1,
          name: 'Sir Fluffington III',
          breed: 'British Shorthair',
          personality: 'Lawful Nap',
          bio: 'Judges your posture.',
          zoomies_per_hour: 0.3,
          naps_per_day: 18,
          judginess_level: 9,
          favorite_product_id: 5,
          img_name: null,
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM cats ORDER BY cat_id');
      expect(result).toHaveLength(1);
      expect(result[0].catId).toBe(1);
      expect(result[0].name).toBe('Sir Fluffington III');
      expect(result[0].judginessLevel).toBe(9);
    });

    it('should return empty array when no cats exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return cat when found', async () => {
      const mockResult = {
        cat_id: 1,
        name: 'Dave the DevOps Cat',
        breed: 'Tabby',
        personality: 'Lawful Chaos',
        bio: 'Pushes to production at 3am.',
        zoomies_per_hour: 2.1,
        naps_per_day: 14,
        judginess_level: 6,
        favorite_product_id: 4,
        img_name: null,
      };
      mockDb.get.mockResolvedValue(mockResult);

      const result = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM cats WHERE cat_id = ?', [1]);
      expect(result?.catId).toBe(1);
      expect(result?.name).toBe('Dave the DevOps Cat');
      expect(result?.zoomiesPerHour).toBe(2.1);
    });

    it('should return null when cat not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new cat and return it', async () => {
      const newCat = {
        name: 'Zoomie McZoomface',
        breed: 'Bengal',
        personality: 'Chaotic Evil',
        bio: 'Lapped the living room 400 times.',
        zoomiesPerHour: 14.8,
        napsPerDay: 6,
        judginessLevel: 3,
        favoriteProductId: 12,
        imgName: null,
      };

      mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
      mockDb.get.mockResolvedValue({
        cat_id: 2,
        name: 'Zoomie McZoomface',
        breed: 'Bengal',
        personality: 'Chaotic Evil',
        bio: 'Lapped the living room 400 times.',
        zoomies_per_hour: 14.8,
        naps_per_day: 6,
        judginess_level: 3,
        favorite_product_id: 12,
        img_name: null,
      });

      const result = await repository.create(newCat);

      expect(mockDb.run).toHaveBeenCalledTimes(1);
      expect(result.catId).toBe(2);
      expect(result.name).toBe('Zoomie McZoomface');
      expect(result.zoomiesPerHour).toBe(14.8);
    });
  });

  describe('update', () => {
    it('should update existing cat and return updated data', async () => {
      const updateData = { name: 'Zoomie McSuperZoom' };

      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        cat_id: 1,
        name: 'Zoomie McSuperZoom',
        breed: 'Bengal',
        personality: 'Chaotic Evil',
        bio: 'Lapped the living room 400 times.',
        zoomies_per_hour: 14.8,
        naps_per_day: 6,
        judginess_level: 3,
        favorite_product_id: 12,
        img_name: null,
      });

      const result = await repository.update(1, updateData);

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE cats SET name = ? WHERE cat_id = ?',
        ['Zoomie McSuperZoom', 1],
      );
      expect(result.name).toBe('Zoomie McSuperZoom');
    });

    it('should throw NotFoundError when cat does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.update(999, { name: 'Ghost Cat' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete existing cat', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });

      await repository.delete(1);

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM cats WHERE cat_id = ?', [1]);
    });

    it('should throw NotFoundError when cat does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });
});
