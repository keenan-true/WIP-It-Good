import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ManagersPage from '../ManagersPage';
import { server } from '../../test/setup';
import { http, HttpResponse } from 'msw';

describe('ManagersPage', () => {
  it('should render loading state initially', () => {
    render(
      <BrowserRouter>
        <ManagersPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display managers after loading', async () => {
    server.use(
      http.get('/api/managers', () => {
        return HttpResponse.json([
          { id: '1', name: 'John Doe', staff: [] }
        ]);
      })
    );

    render(
      <BrowserRouter>
        <ManagersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should open modal when add button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <ManagersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add manager/i }));
    
    expect(screen.getByRole('heading', { name: /add manager/i })).toBeInTheDocument();
  });

  it('should close modal when cancel is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <ManagersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add manager/i }));
    expect(screen.getByRole('heading', { name: /add manager/i })).toBeInTheDocument();
    
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('heading', { name: /add manager/i })).not.toBeInTheDocument();
  });
});
