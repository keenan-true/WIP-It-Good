import { afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// MSW Server Setup
export const server = setupServer(
  // Default handlers
  http.get('/api/managers', () => {
    return HttpResponse.json([
      { id: '1', name: 'Test Manager', staff: [], createdAt: new Date(), updatedAt: new Date() }
    ]);
  }),
  http.get('/api/staff', () => {
    return HttpResponse.json([]);
  }),
  http.get('/api/products', () => {
    return HttpResponse.json([]);
  }),
  http.get('/api/initiatives', () => {
    return HttpResponse.json([]);
  }),
  http.get('/api/allocations', () => {
    return HttpResponse.json([]);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
