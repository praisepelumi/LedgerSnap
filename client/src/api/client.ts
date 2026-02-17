import axios from "axios";

const TOKEN_KEY = "ledgersnap_token";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach JWT from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — unwrap errors and handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      const err = new Error(apiError.message);
      (err as any).code = apiError.code;
      (err as any).details = apiError.details;
      (err as any).status = error.response.status;
      (err as any).response = error.response;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
