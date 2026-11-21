import { api } from "./api";
import type { StudySession } from "../types/session";

export const sessionService = {
  getSessions: async (activeOnly = false): Promise<StudySession[]> => {
    const params = activeOnly ? { active_only: true } : undefined;
    const response = await api.get<StudySession[]>("/sessions/", { params });
    return response.data;
  },

  startSession: async (data: {
    subject_id: string;
    topic_id?: string | null;
  }): Promise<StudySession> => {
    const response = await api.post<StudySession>("/sessions/start", data);
    return response.data;
  },

  finishSession: async (
    sessionId: string,
    data: { duration: number; notes?: string | null },
  ): Promise<StudySession> => {
    const response = await api.patch<StudySession>(
      `/sessions/${sessionId}/finish`,
      data,
    );
    return response.data;
  },

  createManualSession: async (data: {
    subject_id: string;
    topic_id?: string | null;
    duration_minutes: number;
    session_date: string | null;
    notes: string | null;
  }): Promise<StudySession> => {
    const response = await api.post<StudySession>("/sessions/manual", data);
    return response.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/sessions/${sessionId}`);
  },
};
