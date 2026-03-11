import Axios from "axios";
import {
	getToken,
	setToken,
	clearToken,
	clearAuthUser,
} from "../helpers/auth_helper";
import { getAxiosDispatch } from "./axiosDispatch";
import { setAccessToken, clearAuth } from "../slices/auth/reducer";

const baseURL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const axios = Axios.create({
	baseURL,
	withCredentials: true,
});

const refreshClient = Axios.create({
	baseURL,
	withCredentials: true,
});

axios.interceptors.request.use((config) => {
	const token = getToken();
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null) {
	pendingQueue.forEach((cb) => cb(token));
	pendingQueue = [];
}

axios.interceptors.response.use(
	(res) => res,
	async (error) => {
		const originalRequest = error.config;
		const status = error?.response?.status;

		if (originalRequest?._retry) {
			return Promise.reject(error);
		}

		if ((status === 401 || status === 403) && originalRequest) {
			originalRequest._retry = true;

			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					pendingQueue.push((token) => {
						if (!token) return reject(error);
						originalRequest.headers.Authorization = `Bearer ${token}`;
						resolve(axios(originalRequest));
					});
				});
			}

			isRefreshing = true;

			try {
				const refreshResponse = await refreshClient.post("/auth/refresh");

				//   FIX: support { data: { accessToken } } format too
				const newAccessToken =
					refreshResponse?.data?.data?.accessToken ||
					refreshResponse?.data?.accessToken ||
					refreshResponse?.data?.token;

				if (!newAccessToken)
					throw new Error("No access token returned on refresh");

				setToken(newAccessToken);

				const d = getAxiosDispatch();
				d?.(setAccessToken(newAccessToken));

				processQueue(newAccessToken);

				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
				return axios(originalRequest);
			} catch (refreshError) {
				processQueue(null);
				clearToken();
				clearAuthUser();
				const d = getAxiosDispatch();
				d?.(clearAuth());
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);

export default axios;
