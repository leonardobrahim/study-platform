import { api } from "./api";
import type { DashboardData } from "../types/dashboard";

export const dashboardService = {
  getSummary: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>("/dashboard/");
    return response.data;
  },
};
