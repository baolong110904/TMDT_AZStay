// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // Ensure this matches your backend port
  withCredentials: true, // Enable if your backend uses cookies for sessions
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add request interceptor for debugging
api.interceptors.request.use((config) => {
  console.log("Request:", config);
  return config;
}, (error) => Promise.reject(error));

// Optional: Add response interceptor for debugging
api.interceptors.response.use((response) => response, (error) => {
  console.error("Response error:", error.response?.data || error.message);
  return Promise.reject(error);
});

export default api;