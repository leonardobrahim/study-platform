import { api } from "./api";
import type { Task } from "../types/task";

export interface TaskPayload {
  title: string;
  description: string | null;
  due_date: string | null;
  estimated_duration: number | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "COMPLETED";
  subject_id: string | null;
  topic_id: string | null;
}

export const taskService = {
  getTasks: async (filters?: {
    subject_id?: string;
    status?: string;
  }): Promise<Task[]> => {
    const response = await api.get<Task[]>("/tasks/", { params: filters });
    return response.data;
  },

  createTask: async (data: TaskPayload): Promise<Task> => {
    const response = await api.post<Task>("/tasks/", data);
    return response.data;
  },

  updateTask: async (id: string, data: Partial<TaskPayload>): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};
