// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Đúng port backend
  withCredentials: true, // Nếu backend dùng cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để attach token vào request
api.interceptors.request.use((config) => {
  // Thử lấy token từ localStorage
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => Promise.reject(error));

// Interceptor log lỗi response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Response error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
