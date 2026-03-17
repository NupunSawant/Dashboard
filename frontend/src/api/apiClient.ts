import axios from "axios";
import { getToken,setToken,clearToken } from "../helpers/auth_helper";

const apiClient = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
    const token =getToken();
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config;
})

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

const flushQueue = (token:string | null) => {
    pendingQueue.forEach(cb => cb(token));
    pendingQueue = [];
}

apiClient.interceptors.response.use(
    (res) => res,
    async(err) => {
        const originalRequest = err.config;

        if(err?.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            if(isRefreshing) {
                return new Promise((resolve,_) => {
                    pendingQueue.push((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(apiClient(originalRequest));
                    })
                })
            }

            try {
                isRefreshing = true;

                const { data } = await apiClient.post('/auth/users/refresh',{});

                const newAccessToken = data?.accessToken || data?.token;
                if(!newAccessToken){
                    clearToken();
                    flushQueue(null);
                    return Promise.reject(err);
                }

                setToken(newAccessToken);
                flushQueue(newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest)
            } catch(refreshErr) {
                clearToken();
                flushQueue(null);
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(err);
    }
)

export default apiClient;