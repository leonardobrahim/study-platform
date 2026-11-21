import { api } from "./api";
import type { Topic } from "../types/subject";

export interface TopicCreatePayload {
  name: string;
  subject_id: string;
  description: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

export interface TopicUpdatePayload {
  name?: string;
  description?: string | null;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

export const topicService = {
  getTopics: async (subjectId?: string): Promise<Topic[]> => {
    const params = subjectId ? { subject_id: subjectId } : undefined;
    const response = await api.get<Topic[]>("/topics/", { params });
    return response.data;
  },

  createTopic: async (data: TopicCreatePayload): Promise<Topic> => {
    const response = await api.post<Topic>("/topics/", data);
    return response.data;
  },

  updateTopic: async (id: string, data: TopicUpdatePayload): Promise<Topic> => {
    const response = await api.patch<Topic>(`/topics/${id}`, data);
    return response.data;
  },

  deleteTopic: async (id: string): Promise<void> => {
    await api.delete(`/topics/${id}`);
  },
};
