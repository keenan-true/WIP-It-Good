import { z } from 'zod';
import {
  managerSchema,
  staffSchema,
  productSchema,
  initiativeSchema,
  allocationSchema,
} from './schemas.js';

export type Manager = z.infer<typeof managerSchema>;
export type Staff = z.infer<typeof staffSchema>;
export type Product = z.infer<typeof productSchema>;
export type Initiative = z.infer<typeof initiativeSchema>;
export type Allocation = z.infer<typeof allocationSchema>;

export enum Location {
  US = 'US',
  UK = 'UK',
  CONTRACT = 'Contract',
  INDIA = 'India',
}

export enum InitiativeCategory {
  CONTRACT = 'Contract',
  PROMISE = 'Promise',
  EXPECTATION = 'Expectation',
  GROWTH = 'Growth',
}
