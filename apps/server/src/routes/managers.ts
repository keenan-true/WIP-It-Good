import { Router } from 'express';
import prisma from '../config/database.js';
import { validate } from '../middleware/validate.js';
import { managerSchema } from '@wip-it-good/shared';

const router = Router();

// GET all managers
router.get('/', async (req, res) => {
  try {
    const managers = await prisma.manager.findMany({
      include: {
        staff: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(managers);
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(500).json({ error: 'Failed to fetch managers' });
  }
});

// GET manager by ID
router.get('/:id', async (req, res) => {
  try {
    const manager = await prisma.manager.findUnique({
      where: { id: req.params.id },
      include: {
        staff: true,
      },
    });
    if (!manager) {
      return res.status(404).json({ error: 'Manager not found' });
    }
    res.json(manager);
  } catch (error) {
    console.error('Error fetching manager:', error);
    res.status(500).json({ error: 'Failed to fetch manager' });
  }
});

// CREATE manager
router.post('/', validate(managerSchema.omit({ id: true, createdAt: true, updatedAt: true })), async (req, res) => {
  try {
    const manager = await prisma.manager.create({
      data: req.body,
    });
    res.status(201).json(manager);
  } catch (error) {
    console.error('Error creating manager:', error);
    res.status(500).json({ error: 'Failed to create manager' });
  }
});

// UPDATE manager
router.put('/:id', validate(managerSchema.omit({ id: true, createdAt: true, updatedAt: true })), async (req, res) => {
  try {
    const manager = await prisma.manager.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(manager);
  } catch (error) {
    console.error('Error updating manager:', error);
    res.status(500).json({ error: 'Failed to update manager' });
  }
});

// DELETE manager
router.delete('/:id', async (req, res) => {
  try {
    await prisma.manager.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting manager:', error);
    res.status(500).json({ error: 'Failed to delete manager' });
  }
});

export default router;
