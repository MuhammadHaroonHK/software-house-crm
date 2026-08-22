import axios from "axios";
import { authStorage } from "@/features/auth/services/auth-storage";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  /*
   * Let Axios/browser automatically set the correct
   * Content-Type header for FormData requests.
   *
   * For normal objects, Axios will automatically use
   * application/json.
   */
  if (
    config.data instanceof FormData
  ) {
    delete config.headers["Content-Type"];
  }

  return config;
});

export default api;
