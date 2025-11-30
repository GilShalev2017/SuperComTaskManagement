// TaskForm.test.tsx
/// <reference types="vitest" />

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import TaskForm from '../TaskForm';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createTask } from '../../store/slices/taskSlice';

vi.mock('../../store/hooks');
vi.mock('../../store/slices/taskSlice', () => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  fetchTaskById: vi.fn(),
}));

const mockDispatch = vi.fn();
(useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockDispatch);
(useAppSelector as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
  selector({
    tasks: { selectedTask: null, loading: false },
    tags: { tags: [{ id: 1, name: 'Tag1' }] },
  })
);

describe('TaskForm', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all input fields', () => {
    render(<TaskForm open={true} onClose={onClose} />);
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Due Date/i)).toBeInTheDocument();
    // Check that both comboboxes exist (Priority and Tags)
    expect(screen.getAllByRole('combobox').length).toBe(2);
    expect(screen.getAllByText(/Priority/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telephone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tags/i).length).toBeGreaterThan(0);
  });

  test('validates required fields', async () => {
    render(<TaskForm open={true} onClose={onClose} />);
    
    // Clear the default due date value first
    const dueDateInput = screen.getByLabelText(/Due Date/i);
    fireEvent.change(dueDateInput, { target: { value: '' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
    });
    
    // Check for other validation errors
    expect(screen.getByText(/Due date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Telephone is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/At least one tag is required/i)).toBeInTheDocument();
  });

  test('submits form with createTask', async () => {
    const user = userEvent.setup();
    
    // Mock the dispatch to return a resolved promise
    mockDispatch.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    render(<TaskForm open={true} onClose={onClose} />);
    
    // Fill in text fields
    await user.type(screen.getByLabelText(/Title/i), 'My Task');
    await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await user.type(screen.getByLabelText(/Telephone/i), '+123456789');
    await user.type(screen.getByLabelText(/Email/i), 'a@b.com');

    // Handle the Tags Select dropdown - find by aria-labelledby
    const tagsCombobox = screen.getAllByRole('combobox').find(
      el => el.getAttribute('aria-labelledby') === 'mui-component-select-tagIds'
    );
    
    expect(tagsCombobox).toBeDefined();
    await user.click(tagsCombobox!);
    
    // Wait for the dropdown to open and click the tag
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Tag1' })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: 'Tag1' }));

    // Close the dropdown by pressing Escape
    await user.keyboard('{Escape}');
    
    // Wait for the menu to close
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    // Submit the form
    const createButton = screen.getByRole('button', { name: /Create/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});