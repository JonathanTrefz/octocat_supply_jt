import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import catRouter from './cat';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Cat API', () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required foreign key: product id 1 (cats FK references products)
    const db = await getDatabase();
    await db.run(
      'INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)',
      [1, 'Test Supplier'],
    );
    await db.run(
      'INSERT INTO products (product_id, supplier_id, name, price, sku, unit) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 1, 'SmartFeeder One', 129.99, 'CAT-FEED-001', 'piece'],
    );

    app = express();
    app.use(express.json());
    app.use('/cats', catRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should return an empty list when no cats exist', async () => {
    const response = await request(app).get('/cats');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
  });

  it('should create a new cat', async () => {
    const newCat = {
      name: 'Sir Fluffington III',
      breed: 'British Shorthair',
      personality: 'Lawful Nap',
      bio: 'Judges your posture.',
      zoomiesPerHour: 0.3,
      napsPerDay: 18,
      judginessLevel: 9,
      favoriteProductId: 1,
      imgName: null,
    };
    const response = await request(app).post('/cats').send(newCat);
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Sir Fluffington III');
    expect(response.body.breed).toBe('British Shorthair');
    expect(response.body.judginessLevel).toBe(9);
    expect(response.body.catId).toBeDefined();
  });

  it('should get all cats', async () => {
    // Create a cat first
    await request(app).post('/cats').send({
      name: 'Dave the DevOps Cat',
      breed: 'Tabby',
      personality: 'Lawful Chaos',
      zoomiesPerHour: 2.1,
      napsPerDay: 14,
      judginessLevel: 6,
    });

    const response = await request(app).get('/cats');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Dave the DevOps Cat');
  });

  it('should get a cat by ID', async () => {
    const createResponse = await request(app).post('/cats').send({
      name: 'Princess Keyboard Smash',
      breed: 'Siamese',
      personality: 'Chaotic Treat-Seeker',
      zoomiesPerHour: 7.2,
      napsPerDay: 11,
      judginessLevel: 7,
    });
    const catId = createResponse.body.catId;

    const response = await request(app).get(`/cats/${catId}`);
    expect(response.status).toBe(200);
    expect(response.body.catId).toBe(catId);
    expect(response.body.name).toBe('Princess Keyboard Smash');
  });

  it('should return 404 for a non-existing cat', async () => {
    const response = await request(app).get('/cats/999');
    expect(response.status).toBe(404);
  });

  it('should update a cat by ID', async () => {
    const createResponse = await request(app).post('/cats').send({
      name: 'Original Cat',
      breed: 'Tabby',
      personality: 'True Neutral',
      zoomiesPerHour: 1.0,
      napsPerDay: 12,
      judginessLevel: 5,
    });
    const catId = createResponse.body.catId;

    const response = await request(app)
      .put(`/cats/${catId}`)
      .send({ name: 'Updated Cat Name', judginessLevel: 8 });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Cat Name');
    expect(response.body.judginessLevel).toBe(8);
  });

  it('should delete a cat by ID', async () => {
    const createResponse = await request(app).post('/cats').send({
      name: 'Delete Me Cat',
      breed: 'Persian',
      personality: 'Neutral Floof',
      zoomiesPerHour: 0.1,
      napsPerDay: 20,
      judginessLevel: 8,
    });
    const catId = createResponse.body.catId;

    const deleteResponse = await request(app).delete(`/cats/${catId}`);
    expect(deleteResponse.status).toBe(204);

    // Confirm it's gone
    const getResponse = await request(app).get(`/cats/${catId}`);
    expect(getResponse.status).toBe(404);
  });
});
