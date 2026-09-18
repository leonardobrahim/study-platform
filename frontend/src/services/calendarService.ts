import { api } from "./api";
import type { CalendarEvent } from "../types/calendar";

export const calendarService = {
  getEvents: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    
    const response = await api.get<CalendarEvent[]>(`/calendar/?${params.toString()}`);
    return response.data;
  },
};
