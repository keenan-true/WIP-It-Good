import { z } from 'zod';

export const LocationEnum = z.enum(['US', 'UK', 'Contract', 'India']);
export const InitiativeCategoryEnum = z.enum(['Contract', 'Promise', 'Expectation', 'Growth']);

export const managerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Manager name is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const staffSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Staff name is required'),
  location: LocationEnum,
  hourlyCost: z.number().positive('Hourly cost must be positive'),
  managerId: z.string().uuid('Manager is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Product name is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const initiativeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Initiative name is required'),
  productId: z.string().uuid('Product is required'),
  category: InitiativeCategoryEnum,
  description: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const allocationSchema = z.object({
  id: z.string().uuid().optional(),
  staffId: z.string().uuid('Staff is required'),
  initiativeId: z.string().uuid('Initiative is required'),
  month: z.number().int().min(1).max(12, 'Month must be between 1 and 12'),
  year: z.number().int().min(2020).max(2100, 'Year must be valid'),
  percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// CSV import schema
export const staffImportSchema = z.object({
  name: z.string().min(1),
  location: LocationEnum,
  hourlyCost: z.number().positive(),
  managerName: z.string().min(1),
});
