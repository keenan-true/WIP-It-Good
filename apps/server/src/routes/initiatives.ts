import { Router } from 'express';
import prisma from '../config/database.js';
import { validate } from '../middleware/validate.js';
import { initiativeSchema } from '@wip-it-good/shared';

const router = Router();

// GET all initiatives
router.get('/', async (req, res) => {
  try {
    const initiatives = await prisma.initiative.findMany({
      include: {
        product: true,
        allocations: true,
      },
      orderBy: [
        {
          product: {
            name: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ],
    });
    res.json(initiatives);
  } catch (error) {
    console.error('Error fetching initiatives:', error);
    res.status(500).json({ error: 'Failed to fetch initiatives' });
  }
});

// GET initiative by ID
router.get('/:id', async (req, res) => {
  try {
    const initiative = await prisma.initiative.findUnique({
      where: { id: req.params.id },
      include: {
        product: true,
        allocations: {
          include: {
            staff: true,
          },
        },
      },
    });
    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }
    res.json(initiative);
  } catch (error) {
    console.error('Error fetching initiative:', error);
    res.status(500).json({ error: 'Failed to fetch initiative' });
  }
});

// CREATE initiative
router.post('/', validate(initiativeSchema.omit({ id: true, createdAt: true, updatedAt: true })), async (req, res) => {
  try {
    const initiative = await prisma.initiative.create({
      data: req.body,
      include: {
        product: true,
      },
    });
    res.status(201).json(initiative);
  } catch (error) {
    console.error('Error creating initiative:', error);
    res.status(500).json({ error: 'Failed to create initiative' });
  }
});

// UPDATE initiative
router.put('/:id', validate(initiativeSchema.omit({ id: true, createdAt: true, updatedAt: true })), async (req, res) => {
  try {
    const initiative = await prisma.initiative.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        product: true,
      },
    });
    res.json(initiative);
  } catch (error) {
    console.error('Error updating initiative:', error);
    res.status(500).json({ error: 'Failed to update initiative' });
  }
});

// DELETE initiative
router.delete('/:id', async (req, res) => {
  try {
    await prisma.initiative.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting initiative:', error);
    res.status(500).json({ error: 'Failed to delete initiative' });
  }
});

export default router;
