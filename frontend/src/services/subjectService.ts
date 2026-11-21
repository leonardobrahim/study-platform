import { api } from "./api";
import type { Subject } from "../types/subject";

export interface SubjectPayload {
  name: string;
  semester_id: string;
  code: string | null;
  professor: string | null;
  description: string | null;
  color: string | null;
}

export const subjectService = {
  getSubjects: async (semesterId?: string): Promise<Subject[]> => {
    const params = semesterId ? { semester_id: semesterId } : undefined;
    const response = await api.get<Subject[]>("/subjects/", { params });
    return response.data;
  },

  createSubject: async (data: SubjectPayload): Promise<Subject> => {
    const response = await api.post<Subject>("/subjects/", data);
    return response.data;
  },

  updateSubject: async (
    id: string,
    data: Partial<SubjectPayload>,
  ): Promise<Subject> => {
    const response = await api.patch<Subject>(`/subjects/${id}`, data);
    return response.data;
  },

  deleteSubject: async (id: string): Promise<void> => {
    await api.delete(`/subjects/${id}`);
  },
};
