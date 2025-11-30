// src/components/__tests__/TaskList.test.tsx
/// <reference types="vitest" />
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import TaskList from '../TaskList';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteTask } from '../../store/slices/taskSlice';

// Mock hooks and slice
vi.mock('../../store/hooks');
vi.mock('../../store/slices/taskSlice', () => ({
  deleteTask: vi.fn(),
}));

const mockDispatch = vi.fn();

// TypeScript-safe mocks
(useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockDispatch);
(useAppSelector as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
  selector({
    tasks: {
      tasks: [
        {
          id: 1,
          title: 'Task 1',
          description: 'Desc',
          dueDate: new Date(Date.now() + 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          priority: 2,
          fullName: 'John',
          telephone: '123',
          email: 'a@b.com',
          tags: [],
        },
      ],
      loading: false,
    },
    tags: { tags: [] },
  })
);

describe('TaskList', () => {
  const onOpenForm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders tasks', () => {
    render(<TaskList onOpenForm={onOpenForm} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText(/Desc/i)).toBeInTheDocument();
  });

  test('calls onOpenForm when clicking edit', () => {
    render(<TaskList onOpenForm={onOpenForm} />);
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
    expect(onOpenForm).toHaveBeenCalledWith(1);
  });

  test('opens delete dialog and confirms', () => {
    (deleteTask as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    render(<TaskList onOpenForm={onOpenForm} />);
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    expect(deleteTask).toHaveBeenCalled();
  });
});