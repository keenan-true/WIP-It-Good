# Testing Guide

This project uses a comprehensive testing strategy with **50% code coverage threshold** for both frontend and backend.

## Tech Stack

- **Frontend**: Vitest + React Testing Library + MSW (Mock Service Worker)
- **Backend**: Vitest + Supertest + Mocked Prisma
- **E2E**: Playwright

## Running Tests

### All Tests
```bash
npm test
```

### Client Tests
```bash
npm run test --workspace=apps/client

# With UI
npm run test:ui --workspace=apps/client

# With coverage
npm run test:coverage --workspace=apps/client
```

### Server Tests
```bash
npm run test --workspace=apps/server

# With UI
npm run test:ui --workspace=apps/server

# With coverage
npm run test:coverage --workspace=apps/server
```

### E2E Tests
```bash
# Make sure dev server is running first
npm run dev

# In another terminal
npm run test:e2e

# With Playwright UI
npm run test:e2e:ui
```

## Test Structure

### Client Tests
```
apps/client/src/
├── components/
│   └── __tests__/
│       └── Modal.test.tsx
├── pages/
│   └── __tests__/
│       └── ManagersPage.test.tsx
└── test/
    └── setup.ts              # MSW setup and test utilities
```

### Server Tests
```
apps/server/src/
├── routes/
│   └── __tests__/
│       └── managers.test.ts
└── test/
    └── setup.ts              # Prisma mock setup
```

### E2E Tests
```
e2e/
└── managers.spec.ts          # Full CRUD flow tests
```

## Coverage Requirements

Both client and server have **50% minimum coverage** thresholds for:
- Lines
- Functions
- Branches
- Statements

Coverage reports are generated in:
- `apps/client/coverage/`
- `apps/server/coverage/`

## Writing Tests

### Component Tests (Client)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    await user.click(screen.getByRole('button'));
    // assertions...
  });
});
```

### API Tests (Server)

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import myRouter from '../myRouter.js';
import { prismaMock } from '../../test/setup.js';

const app = express();
app.use(express.json());
app.use('/my-endpoint', myRouter);

describe('GET /my-endpoint', () => {
  it('should return data', async () => {
    prismaMock.myModel.findMany.mockResolvedValue([{ id: '1', name: 'Test' }]);
    
    const response = await request(app).get('/my-endpoint');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('should perform user flow', async ({ page }) => {
  await page.goto('/my-page');
  await page.getByRole('button', { name: /submit/i }).click();
  await expect(page.getByText('Success')).toBeVisible();
});
```

## Mocking API Calls (Client)

Use MSW in your tests to mock API responses:

```typescript
import { server } from '../../test/setup';
import { http, HttpResponse } from 'msw';

it('should handle API response', async () => {
  server.use(
    http.get('/api/managers', () => {
      return HttpResponse.json([{ id: '1', name: 'Test Manager' }]);
    })
  );
  
  // Your test code...
});
```

## Mocking Prisma (Server)

The Prisma client is automatically mocked in tests:

```typescript
import { prismaMock } from '../../test/setup.js';

it('should query database', async () => {
  prismaMock.manager.findMany.mockResolvedValue([
    { id: '1', name: 'Test', createdAt: new Date(), updatedAt: new Date() }
  ]);
  
  // Your test code...
});
```

## Continuous Integration

Add to your CI pipeline:

```yaml
- name: Run tests
  run: npm test

- name: Check coverage
  run: npm run test:coverage
```

## Current Test Status

✅ Modal component - 100% coverage
✅ ManagersPage - 50% coverage
✅ Backend /managers routes - Fully tested with mocked Prisma
✅ E2E Managers CRUD flow - Complete

## Next Steps

1. Add tests for remaining pages (Staff, Products, Initiatives, Allocations)
2. Add tests for remaining backend routes
3. Add more E2E scenarios for critical user flows
4. Consider integration tests with test database
5. Add visual regression testing if needed

## Troubleshooting

### Tests not finding modules
- Make sure you've run `npm install` in all workspaces
- Check that TypeScript paths are correctly configured

### MSW not intercepting requests
- Verify MSW handlers in `apps/client/src/test/setup.ts`
- Check that the URL matches exactly (including `/api` prefix)

### Playwright tests failing
- Ensure dev server is running on port 5173
- Try running with UI mode: `npm run test:e2e:ui`
- Check browser console for errors

### Coverage threshold failures
- Run `npm run test:coverage` to see detailed report
- Add more test cases for uncovered code paths
- Consider adjusting thresholds if too aggressive
