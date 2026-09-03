import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

/*
=====================================
REQUEST INTERCEPTOR
=====================================
*/

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    /*
    =====================================
    FORM DATA
    =====================================

    Jika request menggunakan FormData,
    hapus Content-Type JSON agar browser
    otomatis menentukan multipart/form-data
    beserta boundary-nya.
    */

    if (typeof FormData !== "undefined" &&
        config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

/*
=====================================
RESPONSE INTERCEPTOR
=====================================
*/

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const isLoginRequest =
      error.config?.url?.includes("/api/login");

    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;