import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import managersRouter from '../managers.js';
import { prismaMock } from '../../test/setup.js';

const app = express();
app.use(express.json());
app.use('/managers', managersRouter);

describe('GET /managers', () => {
  it('should return all managers with staff', async () => {
    const mockManagers = [
      {
        id: '1',
        name: 'John Doe',
        staff: [
          { id: 's1', name: 'Staff 1', location: 'US', hourlyCost: 50, managerId: '1' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Jane Smith',
        staff: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    prismaMock.manager.findMany.mockResolvedValue(mockManagers as any);

    const response = await request(app).get('/managers');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe('John Doe');
    expect(response.body[0].staff).toHaveLength(1);
    expect(prismaMock.manager.findMany).toHaveBeenCalledWith({
      include: { staff: true },
      orderBy: { name: 'asc' }
    });
  });

  it('should handle errors gracefully', async () => {
    prismaMock.manager.findMany.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/managers');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to fetch managers' });
  });
});

describe('POST /managers', () => {
  it('should create a new manager', async () => {
    const newManager = {
      name: 'New Manager'
    };

    const createdManager = {
      id: '3',
      ...newManager,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    prismaMock.manager.create.mockResolvedValue(createdManager as any);

    const response = await request(app)
      .post('/managers')
      .send(newManager);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('New Manager');
    expect(prismaMock.manager.create).toHaveBeenCalledWith({
      data: newManager
    });
  });
});

describe('DELETE /managers/:id', () => {
  it('should delete a manager', async () => {
    prismaMock.manager.delete.mockResolvedValue({} as any);

    const response = await request(app).delete('/managers/1');

    expect(response.status).toBe(204);
    expect(prismaMock.manager.delete).toHaveBeenCalledWith({
      where: { id: '1' }
    });
  });
});
