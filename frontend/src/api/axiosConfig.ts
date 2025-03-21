import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_BASE_URL,
  withCredentials: true,
});

// Private API (for token-based requests)
export const privateApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// Attach token to private requests
privateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


privateApi.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const response = await privateApi.get('/user/refresh-token');
                if (response.status === 200) {
                    const newAccessToken = response.data.accessToken;
                    localStorage.setItem('accessToken', newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return privateApi(originalRequest);
                }
            } catch (refreshError: any) {
                if (refreshError.response?.status === 403) {
                    localStorage.removeItem('accessToken')
                    const state = store.getState()
                    const userRole = state.menteeAuth.user?.role || state.mentorAuth.user?.role
                    if (userRole === 'mentee') {
                        store.dispatch(menteeLogout())
                    } else if (userRole === 'mentor') {
                        store.dispatch(mentorLogout())
                    }
                }
                console.error('Refresh token failed:', refreshError);
                throw error
            }
        }
        return Promise.reject(error);
    }
);