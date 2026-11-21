import { api } from "./api";
import type { User } from "../types/user";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append("username", email.trim());
    formData.append("password", password);

    const response = await api.post<LoginResponse>("/auth/login", formData);
    return response.data;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> => {
    const response = await api.post<User>("/auth/register", data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },
};
