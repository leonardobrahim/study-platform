import axios from "axios";

// Cria uma instância do Axios configurada com o endereço do nosso backend
export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});
