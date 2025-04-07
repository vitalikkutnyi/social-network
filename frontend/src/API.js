import axios from "axios";

function getCSRFToken() {
  const csrfToken = document.cookie.match(/csrftoken=([^;]+)/);
  return csrfToken ? csrfToken[1] : null;
}

const API = axios.create({
  baseURL: "https://lynquora.me",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  if (["post", "put", "delete"].includes(config.method)) {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (window.location.pathname === "/login/") {
      return Promise.reject(error);
    }

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await API.post(
          "/api/token/refresh/",
          {},
          { withCredentials: true }
        );
        return API(originalRequest);
      } catch (refreshError) {
        console.error(
          "Помилка оновлення токена:",
          refreshError.response?.data || refreshError.message
        );
        document.cookie =
          "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
