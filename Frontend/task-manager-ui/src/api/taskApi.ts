import axiosInstance from './axiosConfig';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';

export const taskApi = {
  getAllTasks: async (): Promise<Task[]> => {
    const response = await axiosInstance.get('/tasks');
    return response.data;
  },

  getTaskById: async (id: number): Promise<Task> => {
    const response = await axiosInstance.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: CreateTaskRequest): Promise<Task> => {
    const response = await axiosInstance.post('/tasks', task);
    return response.data;
  },

  updateTask: async (id: number, task: UpdateTaskRequest): Promise<Task> => {
    const response = await axiosInstance.put(`/tasks/${id}`, task);
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/tasks/${id}`);
  },
};
