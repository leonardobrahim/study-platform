import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Interceptor: antes de qualquer requisição sair, ele injeta o token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@StudyPlatform:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
