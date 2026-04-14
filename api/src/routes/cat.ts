/**
 * @swagger
 * tags:
 *   name: Cats
 *   description: API endpoints for managing OctoCAT Supply mascot cats
 */

/**
 * @swagger
 * /api/cats:
 *   get:
 *     summary: Returns all cats
 *     tags: [Cats]
 *     responses:
 *       200:
 *         description: List of all cats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cat'
 *   post:
 *     summary: Create a new cat
 *     tags: [Cats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cat'
 *     responses:
 *       201:
 *         description: Cat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cat'
 *
 * /api/cats/{id}:
 *   get:
 *     summary: Get a cat by ID
 *     tags: [Cats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cat ID
 *     responses:
 *       200:
 *         description: Cat found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cat'
 *       404:
 *         description: Cat not found
 *   put:
 *     summary: Update a cat
 *     tags: [Cats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cat'
 *     responses:
 *       200:
 *         description: Cat updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cat'
 *       404:
 *         description: Cat not found
 *   delete:
 *     summary: Delete a cat
 *     tags: [Cats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cat ID
 *     responses:
 *       204:
 *         description: Cat deleted successfully
 *       404:
 *         description: Cat not found
 */

import express from 'express';
import { Cat } from '../models/cat';
import { getCatsRepository } from '../repositories/catsRepo';
import { NotFoundError } from '../utils/errors';

const router = express.Router();

// Get all cats
router.get('/', async (req, res, next) => {
  try {
    const repo = await getCatsRepository();
    const cats = await repo.findAll();
    res.json(cats);
  } catch (error) {
    next(error);
  }
});

// Get a cat by ID
router.get('/:id', async (req, res, next) => {
  try {
    const repo = await getCatsRepository();
    const cat = await repo.findById(parseInt(req.params.id));
    if (cat) {
      res.json(cat);
    } else {
      res.status(404).send('Cat not found');
    }
  } catch (error) {
    next(error);
  }
});

// Create a new cat
router.post('/', async (req, res, next) => {
  try {
    const repo = await getCatsRepository();
    const newCat = await repo.create(req.body as Omit<Cat, 'catId'>);
    res.status(201).json(newCat);
  } catch (error) {
    next(error);
  }
});

// Update a cat by ID
router.put('/:id', async (req, res, next) => {
  try {
    const repo = await getCatsRepository();
    const updatedCat = await repo.update(parseInt(req.params.id), req.body);
    res.json(updatedCat);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Cat not found');
    } else {
      next(error);
    }
  }
});

// Delete a cat by ID
router.delete('/:id', async (req, res, next) => {
  try {
    const repo = await getCatsRepository();
    await repo.delete(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Cat not found');
    } else {
      next(error);
    }
  }
});

export default router;
