// TaskForm.test.tsx
/// <reference types="vitest" />

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
(useAppDispatch as unknown as vi.Mock).mockReturnValue(mockDispatch);
(useAppSelector as unknown as vi.Mock).mockImplementation((selector: any) =>
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
    expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telephone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(<TaskForm open={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));
    await waitFor(() => {
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Due date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Telephone is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/At least one tag is required/i)).toBeInTheDocument();
    });
  });

  test('submits form with createTask', async () => {
    (createTask as unknown as vi.Mock).mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    render(<TaskForm open={true} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'My Task' } });
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Telephone/i), { target: { value: '+123456789' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'a@b.com' } });

    fireEvent.mouseDown(screen.getByLabelText(/Tags/i));
    fireEvent.click(screen.getByText('Tag1'));

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
