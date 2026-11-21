import { api } from "./api";
import type { Semester } from "../types/semester";

export interface SemesterPayload {
  name: string;
  year: number;
  period: number;
  status?: "ACTIVE" | "ARCHIVED";
}

export const semesterService = {
  getSemesters: async (): Promise<Semester[]> => {
    const response = await api.get<Semester[]>("/semesters/");
    return response.data;
  },

  createSemester: async (data: SemesterPayload): Promise<Semester> => {
    const response = await api.post<Semester>("/semesters/", data);
    return response.data;
  },

  updateSemester: async (
    id: string,
    data: Partial<SemesterPayload>,
  ): Promise<Semester> => {
    const response = await api.patch<Semester>(`/semesters/${id}`, data);
    return response.data;
  },
};
