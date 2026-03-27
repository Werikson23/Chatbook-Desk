import axios from "axios";
import { getBackendURL } from "../services/config";

const api = axios.create({
	withCredentials: true
});

api.interceptors.request.use(cfg => {
	cfg.baseURL = getBackendURL();
	return cfg;
});

export const openApi = axios.create({});

openApi.interceptors.request.use(cfg => {
	cfg.baseURL = getBackendURL();
	return cfg;
});

export default api;
