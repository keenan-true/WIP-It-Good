import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../Modal';

describe('Modal', () => {
  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('should render with icon when provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal" icon="bi-box">
        <div>Content</div>
      </Modal>
    );
    
    const icon = screen.getByRole('heading').querySelector('i');
    expect(icon).toHaveClass('bi-box');
  });

  it('should call onClose when overlay is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    
    // Click the overlay (the parent div of the modal content)
    const overlay = screen.getByText('Test Modal').closest('div')?.parentElement?.parentElement;
    if (overlay) {
      await user.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should not call onClose when modal content is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    
    await user.click(screen.getByText('Modal Content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should render children correctly', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <button>Test Button</button>
        <input placeholder="Test Input" />
      </Modal>
    );
    
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test Input')).toBeInTheDocument();
  });
});
