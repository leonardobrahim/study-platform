import { api } from "./api";
import type { Assessment } from "../types/assessment";

export const assessmentService = {
  getAssessments: async () => {
    const response = await api.get<Assessment[]>("/assessments");
    return response.data;
  },

  createAssessment: async (data: {
    title: string;
    type: string;
    date: string | null;
    subject_id: string;
    topic_ids: string[];
  }) => {
    const response = await api.post<Assessment>("/assessments", data);
    return response.data;
  },

  updateAssessment: async (
    id: string,
    data: Partial<{
      title: string;
      type: string;
      date: string | null;
      topic_ids: string[];
    }>
  ) => {
    const response = await api.patch<Assessment>(`/assessments/${id}`, data);
    return response.data;
  },

  deleteAssessment: async (id: string) => {
    const response = await api.delete(`/assessments/${id}`);
    return response.data;
  },
};
