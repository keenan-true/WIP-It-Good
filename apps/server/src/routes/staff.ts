import { Router } from 'express';
import multer from 'multer';
import Papa from 'papaparse';
import prisma from '../config/database.js';
import { validate } from '../middleware/validate.js';
import { staffSchema, staffImportSchema } from '@wip-it-good/shared';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET all staff
router.get('/', async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        manager: true,
        allocations: {
          include: {
            initiative: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// GET staff by ID
router.get('/:id', async (req, res) => {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id: req.params.id },
      include: {
        manager: true,
        allocations: {
          include: {
            initiative: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// CREATE staff
router.post('/', validate(staffSchema.omit({ id: true, createdAt: true, updatedAt: true })), async (req, res) => {
  try {
    const staff = await prisma.staff.create({
      data: {
        ...req.body,
        hourlyCost: parseFloat(req.body.hourlyCost),
      },
      include: {
        manager: true,
      },
    });
    res.status(201).json(staff);
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: 'Failed to create staff' });
  }
});

// UPDATE staff
router.put('/:id', validate(staffSchema.omit({ id: true, createdAt: true, updatedAt: true })), async (req, res) => {
  try {
    const staff = await prisma.staff.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        hourlyCost: parseFloat(req.body.hourlyCost),
      },
      include: {
        manager: true,
      },
    });
    res.json(staff);
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ error: 'Failed to update staff' });
  }
});

// DELETE staff
router.delete('/:id', async (req, res) => {
  try {
    await prisma.staff.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ error: 'Failed to delete staff' });
  }
});

// IMPORT staff from CSV
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const csvData = req.file.buffer.toString('utf-8');
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });

    const errors: any[] = [];
    const created: any[] = [];

    for (let i = 0; i < parsed.data.length; i++) {
      const row: any = parsed.data[i];
      
      try {
        // Validate row
        const validated = staffImportSchema.parse({
          name: row.name,
          location: row.location,
          hourlyCost: parseFloat(row.hourlyCost),
          managerName: row.managerName,
        });

        // Find manager by name
        const manager = await prisma.manager.findFirst({
          where: { name: validated.managerName },
        });

        if (!manager) {
          errors.push({
            row: i + 2, // +2 for header and 0-index
            error: `Manager '${validated.managerName}' not found`,
          });
          continue;
        }

        // Create staff
        const staff = await prisma.staff.create({
          data: {
            name: validated.name,
            location: validated.location,
            hourlyCost: validated.hourlyCost,
            managerId: manager.id,
          },
        });

        created.push(staff);
      } catch (error: any) {
        errors.push({
          row: i + 2,
          error: error.message || 'Validation failed',
        });
      }
    }

    res.json({
      success: created.length,
      failed: errors.length,
      created,
      errors,
    });
  } catch (error) {
    console.error('Error importing staff:', error);
    res.status(500).json({ error: 'Failed to import staff' });
  }
});

export default router;
