import axios from "axios";

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  baseURL: "https://salary-slip-mdsheeifx-radha17.vercel.app/api",
  headers: { "Content-Type": "application/json" },
});

// Attach the logged-in admin's token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, bounce back to the login screen
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("rp_token");
      localStorage.removeItem("rp_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
