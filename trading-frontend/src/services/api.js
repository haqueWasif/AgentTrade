import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE || "http://localhost:8000/api/";

const API = axios.create({
  baseURL: API_BASE_URL,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
});

function isPublicEndpoint(url = "") {
  return (
    url.includes("register/") ||
    url.includes("token/") ||
    url.includes("token/refresh/")
  );
}

function clearAuthAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");

  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
}

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && !isPublicEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;

    const tokenInvalid =
      status === 401 &&
      typeof detail === "string" &&
      detail.toLowerCase().includes("token");

    if (tokenInvalid && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await refreshClient.post("token/refresh/", {
          refresh,
        });

        const newAccessToken = refreshResponse.data.access;

        localStorage.setItem("token", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return API(originalRequest);
      } catch (refreshError) {
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return "Could not connect to the server. Make sure the Django backend is running.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.code === "token_not_valid") {
    return "Your session expired. Please login again.";
  }

  const messages = [];

  Object.entries(data).forEach(([field, value]) => {
    if (Array.isArray(value)) {
      messages.push(`${field}: ${value.join(" ")}`);
    } else if (typeof value === "object" && value !== null) {
      messages.push(`${field}: ${JSON.stringify(value)}`);
    } else {
      messages.push(`${field}: ${value}`);
    }
  });

  return messages.length ? messages.join("\n") : "Something went wrong.";
}

export default API;