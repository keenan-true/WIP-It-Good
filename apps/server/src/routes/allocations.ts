import { Router } from 'express';
import prisma from '../config/database.js';
import { validate } from '../middleware/validate.js';
import { allocationSchema } from '@wip-it-good/shared';

const router = Router();

// GET all allocations with optional filters
router.get('/', async (req, res) => {
  try {
    const { staffId, initiativeId, month, year } = req.query;
    
    const where: any = {};
    if (staffId) where.staffId = staffId as string;
    if (initiativeId) where.initiativeId = initiativeId as string;
    if (month) where.month = parseInt(month as string);
    if (year) where.year = parseInt(year as string);

    const allocations = await prisma.allocation.findMany({
      where,
      include: {
        staff: {
          include: {
            manager: true,
          },
        },
        initiative: {
          include: {
            product: true,
          },
        },
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' },
      ],
    });
    res.json(allocations);
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({ error: 'Failed to fetch allocations' });
  }
});

// GET allocation summary for a staff member in a specific month
router.get('/summary/:staffId/:month/:year', async (req, res) => {
  try {
    const { staffId, month, year } = req.params;
    
    const allocations = await prisma.allocation.findMany({
      where: {
        staffId,
        month: parseInt(month),
        year: parseInt(year),
      },
      include: {
        initiative: {
          include: {
            product: true,
          },
        },
      },
    });

    const totalPercentage = allocations.reduce(
      (sum, allocation) => sum + parseFloat(allocation.percentage.toString()),
      0
    );

    // Calculate monthly hours (2080 annual hours / 12 months ≈ 173.33 hours/month)
    const monthlyHours = 173.33;
    const totalHours = Math.round((totalPercentage / 100) * monthlyHours);

    res.json({
      staffId,
      month: parseInt(month),
      year: parseInt(year),
      totalPercentage,
      totalHours,
      allocations,
      isOverAllocated: totalPercentage > 100,
    });
  } catch (error) {
    console.error('Error fetching allocation summary:', error);
    res.status(500).json({ error: 'Failed to fetch allocation summary' });
  }
});

// GET allocation by ID
router.get('/:id', async (req, res) => {
  try {
    const allocation = await prisma.allocation.findUnique({
      where: { id: req.params.id },
      include: {
        staff: true,
        initiative: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!allocation) {
      return res.status(404).json({ error: 'Allocation not found' });
    }
    res.json(allocation);
  } catch (error) {
    console.error('Error fetching allocation:', error);
    res.status(500).json({ error: 'Failed to fetch allocation' });
  }
});

// CREATE or UPDATE allocation
router.post('/', validate(allocationSchema.omit({ id: true, createdAt: true, updatedAt: true })), async (req, res) => {
  try {
    const { staffId, initiativeId, month, year, percentage } = req.body;

    // Check if allocation already exists
    const existing = await prisma.allocation.findFirst({
      where: {
        staffId,
        initiativeId,
        month,
        year,
      },
    });

    let allocation;
    if (existing) {
      // Update existing
      allocation = await prisma.allocation.update({
        where: { id: existing.id },
        data: { percentage: parseFloat(percentage) },
        include: {
          staff: true,
          initiative: {
            include: {
              product: true,
            },
          },
        },
      });
    } else {
      // Create new
      allocation = await prisma.allocation.create({
        data: {
          staffId,
          initiativeId,
          month,
          year,
          percentage: parseFloat(percentage),
        },
        include: {
          staff: true,
          initiative: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    res.status(existing ? 200 : 201).json(allocation);
  } catch (error) {
    console.error('Error creating/updating allocation:', error);
    res.status(500).json({ error: 'Failed to create/update allocation' });
  }
});

// UPDATE allocation
router.put('/:id', validate(allocationSchema.omit({ id: true, createdAt: true, updatedAt: true })), async (req, res) => {
  try {
    const allocation = await prisma.allocation.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        percentage: parseFloat(req.body.percentage),
      },
      include: {
        staff: true,
        initiative: {
          include: {
            product: true,
          },
        },
      },
    });
    res.json(allocation);
  } catch (error) {
    console.error('Error updating allocation:', error);
    res.status(500).json({ error: 'Failed to update allocation' });
  }
});

// DELETE allocation
router.delete('/:id', async (req, res) => {
  try {
    await prisma.allocation.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting allocation:', error);
    res.status(500).json({ error: 'Failed to delete allocation' });
  }
});

// BATCH upsert allocations (for grid updates)
router.post('/batch', async (req, res) => {
  try {
    const { allocations } = req.body;

    if (!Array.isArray(allocations)) {
      return res.status(400).json({ error: 'Allocations must be an array' });
    }

    const results = [];

    for (const alloc of allocations) {
      try {
        const validated = allocationSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(alloc);
        
        const existing = await prisma.allocation.findFirst({
          where: {
            staffId: validated.staffId,
            initiativeId: validated.initiativeId,
            month: validated.month,
            year: validated.year,
          },
        });

        let allocation;
        if (existing) {
          allocation = await prisma.allocation.update({
            where: { id: existing.id },
            data: { percentage: parseFloat(validated.percentage.toString()) },
          });
        } else {
          allocation = await prisma.allocation.create({
            data: {
              ...validated,
              percentage: parseFloat(validated.percentage.toString()),
            },
          });
        }

        results.push(allocation);
      } catch (error) {
        console.error('Error processing allocation:', error);
      }
    }

    res.json({ success: true, count: results.length, allocations: results });
  } catch (error) {
    console.error('Error batch updating allocations:', error);
    res.status(500).json({ error: 'Failed to batch update allocations' });
  }
});

export default router;
