import { describe, test, expect, vi, beforeEach } from 'vitest';
import taskReducer, {
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  clearSelectedTask,
  clearError,
} from '../taskSlice';

import type { Task } from '../../../types';
import { taskApi } from '../../../api/taskApi';

// Mock task API
vi.mock('../../../api/taskApi', () => ({
  taskApi: {
    getAllTasks: vi.fn(),
    getTaskById: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  }
}));

describe('taskSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const initialState = {
    tasks: [],
    selectedTask: null,
    loading: false,
    error: null,
  };

  test('returns initial state', () => {
    expect(taskReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  // FETCH TASKS
  test('fetchTasks.pending sets loading', () => {
    const nextState = taskReducer(initialState, fetchTasks.pending('', undefined));
    expect(nextState.loading).toBe(true);
    expect(nextState.error).toBeNull();
  });

  test('fetchTasks.fulfilled stores tasks', () => {
    const mockTasks: Task[] = [{ id: 1, title: 'A', fullName: '', telephone: '', email: '', description: '', tags: [], priority: 1, createdAt: '', dueDate: '' }];

    const nextState = taskReducer(
      initialState,
      fetchTasks.fulfilled(mockTasks, '', undefined)
    );

    expect(nextState.loading).toBe(false);
    expect(nextState.tasks).toEqual(mockTasks);
  });

  test('fetchTasks.rejected sets error', () => {
    const nextState = taskReducer(
      initialState,
      fetchTasks.rejected(new Error('Boom!'), '', undefined)
    );

    expect(nextState.loading).toBe(false);
    expect(nextState.error).toBe('Boom!');
  });

  // FETCH BY ID
  test('fetchTaskById.fulfilled sets selectedTask', () => {
    const mockTask = { id: 10 } as Task;

    const nextState = taskReducer(
      initialState,
      fetchTaskById.fulfilled(mockTask, '', 10)
    );

    expect(nextState.selectedTask).toEqual(mockTask);
  });

  // CREATE TASK
  test('createTask.fulfilled inserts at top', () => {
    const startState = { ...initialState, tasks: [{ id: 1 } as Task] };
    const newTask = { id: 2 } as Task;

    const nextState = taskReducer(
      startState,
      createTask.fulfilled(newTask, '', {} as any)
    );

    expect(nextState.tasks[0]).toEqual(newTask);
  });

  // UPDATE
  test('updateTask.fulfilled updates existing task', () => {
    const startState = { ...initialState, tasks: [{ id: 1, title: 'Old' } as Task] };
    const updated = { id: 1, title: 'New' } as Task;

    const nextState = taskReducer(
      startState,
      updateTask.fulfilled(updated, '', { id: 1, task: {} as any })
    );

    expect(nextState.tasks[0]).toEqual(updated);
  });

  // DELETE
  test('deleteTask.fulfilled removes task', () => {
    const startState = { ...initialState, tasks: [{ id: 1 } as Task] };

    const nextState = taskReducer(
      startState,
      deleteTask.fulfilled(1, '', 1)
    );

    expect(nextState.tasks).toHaveLength(0);
  });

  // REDUCERS
  test('clearSelectedTask sets selectedTask=null', () => {
    const startState = { ...initialState, selectedTask: { id: 1 } as Task };
    const nextState = taskReducer(startState, clearSelectedTask());
    expect(nextState.selectedTask).toBeNull();
  });

  test('clearError sets error=null', () => {
    const startState = { ...initialState, error: 'oops' };
    const nextState = taskReducer(startState, clearError());
    expect(nextState.error).toBeNull();
  });

  // Thunk API calls
  test('fetchTasks calls getAllTasks', async () => {
    (taskApi.getAllTasks as vi.Mock).mockResolvedValue([]);

    await fetchTasks()(vi.fn(), vi.fn(), undefined);

    expect(taskApi.getAllTasks).toHaveBeenCalled();
  });

  test('createTask calls taskApi.createTask', async () => {
    (taskApi.createTask as vi.Mock).mockResolvedValue({ id: 1 });

    await createTask({ title: 'A' } as any)(vi.fn(), vi.fn(), undefined);

    expect(taskApi.createTask).toHaveBeenCalled();
  });

  test('deleteTask calls taskApi.deleteTask', async () => {
    (taskApi.deleteTask as vi.Mock).mockResolvedValue(undefined);

    await deleteTask(1)(vi.fn(), vi.fn(), undefined);

    expect(taskApi.deleteTask).toHaveBeenCalledWith(1);
  });
});
