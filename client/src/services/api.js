
import axios from "axios";

// Configure the connection to the Express REST API.
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5002/api",
  timeout: 15000,
});

// Automatically include the JWT on authenticated requests.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("notes_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Standardize common API error messages.
export function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === "ERR_NETWORK") {
    return "Cannot connect to the server. Check your API URL.";
  }

  return error.message || "Something went wrong";
}

export default api;
