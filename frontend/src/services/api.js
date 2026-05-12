import axios from 'axios';
import Swal from 'sweetalert2';

const api = axios.create({
  // Jangan hardcode URL API, gunakan environment variable
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor untuk menyisipkan token pada setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isLoginRequest = requestUrl.includes('/api/login');

    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');

      Swal.fire({
        icon: 'warning',
        title: 'Sesi login berakhir',
        text: 'Silakan login kembali untuk melanjutkan.',
        confirmButtonColor: '#5D688A',
      }).then(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;
