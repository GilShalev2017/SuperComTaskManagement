export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  priority: number;
  fullName: string;
  telephone: string;
  email: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate: string;
  priority: number;
  fullName: string;
  telephone: string;
  email: string;
  tagIds: number[];
}

export interface UpdateTaskRequest extends CreateTaskRequest {}

export interface Tag {
  id: number;
  name: string;
}

export interface CreateTagRequest {
  name: string;
}

export const PriorityLabels: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
};
