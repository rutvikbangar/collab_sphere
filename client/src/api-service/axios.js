import axios from "axios";

const baseUrl = "https://collab-sphere-server.onrender.com/api/v1";

const instance = axios.create({
  baseURL: baseUrl,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});


instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  // If the response is successful
  (response) => response,
  // If the response has an error
  (error) => {
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Remove the invalid token from local storage
      localStorage.removeItem("accessToken");
      // Redirect the user to the login page
      window.location.href = '/login';
    }
    // For all other errors, just pass them on
    return Promise.reject(error);
  }
);

export default instance;
